// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./OuiScore.sol";
import "./OuiDID.sol";

/**
 * @title OuiEscrow
 * @notice Trustless escrow for campus task gigs. Holds cNGN (Naira stablecoin).
 */
contract OuiEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum State { OPEN, LOCKED, SUBMITTED, APPROVED, DISPUTED, RESOLVED, REFUNDED }

    struct Task {
        uint256 taskId;
        address poster;
        address doer;
        uint256 amount;
        uint256 platformFee;
        uint256 escrowFee;
        uint256 deadline;
        uint256 submittedAt;
        uint256 disputeRaisedAt;
        State state;
        uint8 disputeVotesFor;
        uint8 disputeVotesAgainst;
        address disputeRaiser;
        bool adminResolved;
        string adminReason;
    }

    uint256 public constant PLATFORM_FEE_BPS = 800;
    uint256 public constant ESCROW_FEE_BPS = 150;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant AUTO_RELEASE_WINDOW = 48 hours;
    uint256 public constant DISPUTE_FEE = 500e18;
    uint256 public constant MIN_TASK_AMOUNT = 500e18;
    uint256 public constant MAX_TASK_DURATION = 30 days;
    uint256 public constant MAX_ARBITERS = 5;
    uint256 public constant ADMIN_DELAY = 96 hours;

    IERC20 public immutable cNGN;
    OuiScore public immutable ouiScore;
    OuiDID public immutable ouiDID;
    address public treasury;
    uint256 private _taskCounter;

    mapping(uint256 => Task) private _tasks;
    mapping(uint256 => mapping(address => bool)) private _hasVoted;

    event TaskCreated(uint256 indexed taskId, address indexed poster, uint256 amount, uint256 deadline);
    event TaskAccepted(uint256 indexed taskId, address indexed doer);
    event WorkSubmitted(uint256 indexed taskId, address indexed doer);
    event WorkApproved(uint256 indexed taskId, address indexed poster, address indexed doer, uint256 payout);
    event AutoReleased(uint256 indexed taskId, address indexed doer, uint256 payout);
    event Refunded(uint256 indexed taskId, address indexed poster, uint256 amount);
    event DisputeRaised(uint256 indexed taskId, address indexed raiser);
    event DisputeVoteCast(uint256 indexed taskId, address indexed arbiter, bool releaseToDoer);
    event DisputeResolved(uint256 indexed taskId, bool doerWins, bool tie);
    event AdminResolution(uint256 indexed taskId, bool releaseToDoer, string reason, uint256 timestamp);

    error NotPoster(); error NotDoer(); error WrongState(); error TooEarly(); error AmountTooLow(); error AlreadyVoted(); error NotEligible();

    constructor(address _cNGN, address _score, address _did, address _treasury) Ownable(msg.sender) {
        cNGN = IERC20(_cNGN);
        ouiScore = OuiScore(_score);
        ouiDID = OuiDID(_did);
        treasury = _treasury;
    }

    function setTreasury(address _treasury) external onlyOwner { treasury = _treasury; }

    function createTask(uint256 amount, uint256 duration) external nonReentrant returns (uint256 taskId) {
        if (amount < MIN_TASK_AMOUNT) revert AmountTooLow();
        uint256 eFee = (amount * ESCROW_FEE_BPS) / BPS_DENOMINATOR;
        taskId = ++_taskCounter;
        _tasks[taskId].taskId = taskId;
        _tasks[taskId].poster = msg.sender;
        _tasks[taskId].amount = amount;
        _tasks[taskId].platformFee = (amount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        _tasks[taskId].escrowFee = eFee;
        _tasks[taskId].deadline = block.timestamp + duration;
        
        uint256 balBefore = cNGN.balanceOf(address(this));
        cNGN.safeTransferFrom(msg.sender, address(this), amount + eFee);
        require(cNGN.balanceOf(address(this)) - balBefore == amount + eFee, "Fee on transfer not supported");
        
        ouiScore.incrementPayment(msg.sender);
        emit TaskCreated(taskId, msg.sender, amount, _tasks[taskId].deadline);
    }

    function acceptTask(uint256 taskId) external nonReentrant {
        Task storage t = _tasks[taskId];
        if (t.state != State.OPEN || msg.sender == t.poster || block.timestamp > t.deadline) revert WrongState();
        if (t.amount >= 10000e18 && !ouiScore.meetsThreshold(msg.sender, OuiScore.Tier.BRONZE)) revert NotEligible();
        if (t.amount >= 50000e18 && !ouiScore.meetsThreshold(msg.sender, OuiScore.Tier.GOLD)) revert NotEligible();
        
        t.doer = msg.sender;
        t.state = State.LOCKED;
        ouiScore.incrementAcceptance(msg.sender);
        emit TaskAccepted(taskId, msg.sender);
    }

    function submitWork(uint256 taskId) external {
        Task storage t = _tasks[taskId];
        if (msg.sender != t.doer || t.state != State.LOCKED) revert WrongState();
        t.state = State.SUBMITTED;
        t.submittedAt = block.timestamp;
        emit WorkSubmitted(taskId, msg.sender);
    }

    function approveWork(uint256 taskId) external nonReentrant {
        Task storage t = _tasks[taskId];
        if (msg.sender != t.poster || t.state != State.SUBMITTED) revert WrongState();
        _finalize(taskId, true);
        emit WorkApproved(taskId, t.poster, t.doer, t.amount - t.platformFee);
    }

    function autoRelease(uint256 taskId) external nonReentrant {
        Task storage t = _tasks[taskId];
        if (t.state != State.SUBMITTED || block.timestamp < t.submittedAt + AUTO_RELEASE_WINDOW) revert TooEarly();
        _finalize(taskId, true);
        emit AutoReleased(taskId, t.doer, t.amount - t.platformFee);
    }

    function claimRefund(uint256 taskId) external nonReentrant {
        Task storage t = _tasks[taskId];
        if (msg.sender != t.poster || block.timestamp <= t.deadline) revert WrongState();
        if (t.state != State.OPEN && t.state != State.LOCKED) revert WrongState();
        
        t.state = State.REFUNDED;
        cNGN.safeTransfer(t.poster, t.amount + t.escrowFee);
        if (t.doer != address(0)) ouiScore.penalizeDispute(t.doer);
        emit Refunded(taskId, t.poster, t.amount + t.escrowFee);
    }

    function raiseDispute(uint256 taskId) external nonReentrant {
        Task storage t = _tasks[taskId];
        if ((msg.sender != t.poster && msg.sender != t.doer) || t.state != State.SUBMITTED) revert WrongState();
        
        t.state = State.DISPUTED;
        t.disputeRaisedAt = block.timestamp;
        t.disputeRaiser = msg.sender;
        
        uint256 balBefore = cNGN.balanceOf(address(this));
        cNGN.safeTransferFrom(msg.sender, address(this), DISPUTE_FEE);
        require(cNGN.balanceOf(address(this)) - balBefore == DISPUTE_FEE, "Fee on transfer");
        
        ouiScore.incrementDisputeTotal(t.poster);
        ouiScore.incrementDisputeTotal(t.doer);
        emit DisputeRaised(taskId, msg.sender);
    }

    function castDisputeVote(uint256 taskId, bool releaseToDoer) external nonReentrant {
        Task storage t = _tasks[taskId];
        if (t.state != State.DISPUTED || _hasVoted[taskId][msg.sender]) revert WrongState();
        if (msg.sender == t.poster || msg.sender == t.doer || !ouiDID.canArbitrate(msg.sender)) revert NotEligible();
        
        uint256 elapsed = block.timestamp - t.disputeRaisedAt;
        if (elapsed < 24 hours && !ouiScore.meetsThreshold(msg.sender, OuiScore.Tier.DIAMOND)) revert NotEligible();
        if (elapsed >= 24 hours && !ouiScore.meetsThreshold(msg.sender, OuiScore.Tier.GOLD)) revert NotEligible();

        _hasVoted[taskId][msg.sender] = true;
        if (releaseToDoer) t.disputeVotesFor++; else t.disputeVotesAgainst++;
        emit DisputeVoteCast(taskId, msg.sender, releaseToDoer);

        if (t.disputeVotesFor + t.disputeVotesAgainst == MAX_ARBITERS || (elapsed >= 72 hours && t.disputeVotesFor + t.disputeVotesAgainst >= 3)) {
            _resolveDispute(taskId);
        }
    }

    function adminResolveDispute(uint256 taskId, bool releaseToDoer, string calldata reason) external onlyOwner nonReentrant {
        Task storage t = _tasks[taskId];
        if (t.state != State.DISPUTED || block.timestamp < t.disputeRaisedAt + ADMIN_DELAY) revert TooEarly();
        t.adminResolved = true;
        t.adminReason = reason;
        _resolveDispute(taskId);
        emit AdminResolution(taskId, releaseToDoer, reason, block.timestamp);
    }

    function _resolveDispute(uint256 taskId) internal {
        Task storage t = _tasks[taskId];
        t.state = State.RESOLVED;
        bool doerWins = t.disputeVotesFor > t.disputeVotesAgainst;
        bool tie = t.disputeVotesFor == t.disputeVotesAgainst;

        if (tie) {
            uint256 half = (t.amount - t.platformFee) / 2;
            cNGN.safeTransfer(t.poster, half);
            cNGN.safeTransfer(t.doer, half);
            cNGN.safeTransfer(treasury, t.platformFee + t.escrowFee + DISPUTE_FEE);
            ouiScore.penalizeDispute(t.poster);
            ouiScore.penalizeDispute(t.doer);
        } else if (doerWins) {
            cNGN.safeTransfer(t.doer, t.amount - t.platformFee + DISPUTE_FEE);
            cNGN.safeTransfer(treasury, t.platformFee + t.escrowFee);
            ouiScore.incrementCompletion(t.doer);
            ouiScore.penalizeDispute(t.poster);
        } else {
            cNGN.safeTransfer(t.poster, t.amount + t.escrowFee + DISPUTE_FEE);
            cNGN.safeTransfer(treasury, t.platformFee);
            ouiScore.penalizeDispute(t.doer);
        }
        emit DisputeResolved(taskId, doerWins, tie);
    }

    function _finalize(uint256 taskId, bool success) internal {
        Task storage t = _tasks[taskId];
        t.state = success ? State.APPROVED : State.REFUNDED;
        if (success) {
            cNGN.safeTransfer(t.doer, t.amount - t.platformFee);
            cNGN.safeTransfer(treasury, t.platformFee + t.escrowFee);
            ouiScore.incrementCompletion(t.doer);
            ouiScore.submitRating(t.doer, 4);
        }
    }

    function getTask(uint256 taskId) external view returns (Task memory) { return _tasks[taskId]; }
}
