// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OuiScore
 * @notice Permanent on-chain reputation for Nigerian university students.
 */
contract OuiScore is Ownable {
    enum Tier { STARTER, BRONZE, GOLD, DIAMOND }

    struct StudentProfile {
        uint256 completionScore;
        uint256 completionTotal;
        uint256 paymentScore;
        uint256 paymentTotal;
        uint256 ratingTotal;
        uint256 ratingCount;
        uint256 disputesLost;
        uint256 disputesTotal;
        uint256 referrals;
        uint256 totalScore;
        Tier tier;
        bool exists;
    }

    mapping(address => StudentProfile) private _profiles;
    mapping(address => bool) public authorizedContracts;

    event ScoreUpdated(address indexed student, uint256 score, Tier tier);
    event ScorePenalized(address indexed student, uint256 score, Tier tier);
    event ContractAuthorized(address indexed contractAddress);
    event ContractDeauthorized(address indexed contractAddress);

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender], "Not authorized");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
        emit ContractAuthorized(contractAddress);
    }

    function deauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
        emit ContractDeauthorized(contractAddress);
    }

    function _ensureProfile(address student) internal returns (StudentProfile storage) {
        if (!_profiles[student].exists) {
            _profiles[student].exists = true;
            _profiles[student].tier = Tier.STARTER;
        }
        return _profiles[student];
    }

    function incrementCompletion(address student) external onlyAuthorized {
        StudentProfile storage p = _ensureProfile(student);
        p.completionScore++;
        p.completionTotal++;
        _recalculate(student);
    }

    function incrementAcceptance(address student) external onlyAuthorized {
        _ensureProfile(student).completionTotal++;
    }

    function incrementPayment(address student) external onlyAuthorized {
        StudentProfile storage p = _ensureProfile(student);
        p.paymentScore++;
        p.paymentTotal++;
        _recalculate(student);
    }

    function submitRating(address student, uint8 rating) external onlyAuthorized {
        require(rating >= 1 && rating <= 5, "1-5 only");
        StudentProfile storage p = _ensureProfile(student);
        p.ratingTotal += rating;
        p.ratingCount++;
        _recalculate(student);
    }

    function penalizeDispute(address student) external onlyAuthorized {
        StudentProfile storage p = _ensureProfile(student);
        p.disputesLost++;
        p.disputesTotal++;
        _recalculate(student);
        emit ScorePenalized(student, p.totalScore, p.tier);
    }

    function incrementDisputeTotal(address student) external onlyAuthorized {
        _ensureProfile(student).disputesTotal++;
    }

    function addReferral(address student) external onlyAuthorized {
        StudentProfile storage p = _ensureProfile(student);
        if (p.referrals < 50) p.referrals++;
        _recalculate(student);
    }

    function _recalculate(address student) internal {
        StudentProfile storage p = _profiles[student];
        uint256 cR = p.completionTotal > 0 ? (p.completionScore * 100) / p.completionTotal : 0;
        uint256 pR = p.paymentTotal > 0 ? (p.paymentScore * 100) / p.paymentTotal : 0;
        uint256 aR = p.ratingCount > 0 ? (p.ratingTotal * 20) / p.ratingCount : 50;
        uint256 dP = p.disputesTotal > 0 ? ((p.disputesTotal - p.disputesLost) * 100) / p.disputesTotal : 100;
        uint256 rS = p.referrals * 2;

        p.totalScore = (cR * 300 + pR * 250 + aR * 200 + dP * 150 + rS * 100) / 1000;

        if (p.totalScore >= 800) p.tier = Tier.DIAMOND;
        else if (p.totalScore >= 600) p.tier = Tier.GOLD;
        else if (p.totalScore >= 400) p.tier = Tier.BRONZE;
        else p.tier = Tier.STARTER;

        emit ScoreUpdated(student, p.totalScore, p.tier);
    }

    function getScore(address student) external view returns (uint256) { return _profiles[student].totalScore; }
    function getTier(address student) external view returns (Tier) { return _profiles[student].tier; }
    function meetsThreshold(address student, Tier threshold) external view returns (bool) {
        return uint256(_profiles[student].tier) >= uint256(threshold);
    }
    function getProfile(address student) external view returns (StudentProfile memory) { return _profiles[student]; }
}
