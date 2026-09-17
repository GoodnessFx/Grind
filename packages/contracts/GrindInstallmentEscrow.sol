// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GrindInstallmentEscrow
 * @dev Escrow contract for staged installment purchases and group buys.
 */
contract GrindInstallmentEscrow {
    
    address public owner;
    
    struct InstallmentPlan {
        address seller;
        address buyer;
        uint256 totalAmount;
        uint256 totalInstallments;
        uint256 installmentsPaid;
        uint256 amountPerInstallment;
        uint256 lastPaymentTime;
        uint256 gracePeriod;
        bool isCompleted;
        bool isCancelled;
    }
    
    struct GroupBuyBundle {
        address seller;
        uint256 totalSlots;
        uint256 filledSlots;
        uint256 pricePerSlot;
        uint256 deadline;
        bool isFulfilled;
        bool isCancelled;
    }
    
    mapping(bytes32 => InstallmentPlan) public installmentPlans;
    mapping(bytes32 => GroupBuyBundle) public groupBuys;
    mapping(bytes32 => mapping(address => bool)) public groupBuyCommitments;
    
    event InstallmentPlanCreated(bytes32 indexed planId, address indexed seller, address indexed buyer, uint256 totalAmount);
    event InstallmentPaid(bytes32 indexed planId, uint256 amount, uint256 installmentNumber);
    event InstallmentCompleted(bytes32 indexed planId);
    
    event GroupBuyCreated(bytes32 indexed bundleId, address indexed seller, uint256 slots, uint256 deadline);
    event GroupBuyCommitted(bytes32 indexed bundleId, address indexed buyer);
    event GroupBuyFulfilled(bytes32 indexed bundleId);
    event GroupBuyCancelled(bytes32 indexed bundleId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // --- Installment Logic ---
    
    function createInstallmentPlan(
        bytes32 planId,
        address seller,
        address buyer,
        uint256 totalAmount,
        uint256 totalInstallments,
        uint256 gracePeriodDays
    ) external payable {
        require(installmentPlans[planId].seller == address(0), "Plan exists");
        require(totalInstallments > 1, "Must be > 1 installments");
        
        uint256 amountPerInst = totalAmount / totalInstallments;
        require(msg.value >= amountPerInst, "Must pay at least first installment");
        
        installmentPlans[planId] = InstallmentPlan({
            seller: seller,
            buyer: buyer,
            totalAmount: totalAmount,
            totalInstallments: totalInstallments,
            installmentsPaid: 1,
            amountPerInstallment: amountPerInst,
            lastPaymentTime: block.timestamp,
            gracePeriod: gracePeriodDays * 1 days,
            isCompleted: false,
            isCancelled: false
        });
        
        // Release first installment to seller proportionally
        payable(seller).transfer(msg.value);
        
        emit InstallmentPlanCreated(planId, seller, buyer, totalAmount);
        emit InstallmentPaid(planId, msg.value, 1);
    }
    
    function payInstallment(bytes32 planId) external payable {
        InstallmentPlan storage plan = installmentPlans[planId];
        require(plan.seller != address(0), "Plan does not exist");
        require(!plan.isCompleted && !plan.isCancelled, "Plan inactive");
        require(msg.sender == plan.buyer, "Only buyer");
        require(msg.value >= plan.amountPerInstallment, "Insufficient amount");
        
        plan.installmentsPaid += 1;
        plan.lastPaymentTime = block.timestamp;
        
        payable(plan.seller).transfer(msg.value);
        
        emit InstallmentPaid(planId, msg.value, plan.installmentsPaid);
        
        if (plan.installmentsPaid >= plan.totalInstallments) {
            plan.isCompleted = true;
            emit InstallmentCompleted(planId);
        }
    }
    
    // --- Group Buy Logic ---
    
    function createGroupBuy(
        bytes32 bundleId,
        address seller,
        uint256 totalSlots,
        uint256 pricePerSlot,
        uint256 durationDays
    ) external {
        require(groupBuys[bundleId].seller == address(0), "Bundle exists");
        
        groupBuys[bundleId] = GroupBuyBundle({
            seller: seller,
            totalSlots: totalSlots,
            filledSlots: 0,
            pricePerSlot: pricePerSlot,
            deadline: block.timestamp + (durationDays * 1 days),
            isFulfilled: false,
            isCancelled: false
        });
        
        emit GroupBuyCreated(bundleId, seller, totalSlots, groupBuys[bundleId].deadline);
    }
    
    function commitToGroupBuy(bytes32 bundleId) external payable {
        GroupBuyBundle storage bundle = groupBuys[bundleId];
        require(bundle.seller != address(0), "Bundle does not exist");
        require(block.timestamp <= bundle.deadline, "Deadline passed");
        require(!bundle.isFulfilled && !bundle.isCancelled, "Bundle inactive");
        require(bundle.filledSlots < bundle.totalSlots, "Bundle full");
        require(msg.value >= bundle.pricePerSlot, "Insufficient amount");
        require(!groupBuyCommitments[bundleId][msg.sender], "Already committed");
        
        groupBuyCommitments[bundleId][msg.sender] = true;
        bundle.filledSlots += 1;
        
        emit GroupBuyCommitted(bundleId, msg.sender);
        
        if (bundle.filledSlots == bundle.totalSlots) {
            bundle.isFulfilled = true;
            uint256 totalPool = bundle.totalSlots * bundle.pricePerSlot;
            payable(bundle.seller).transfer(totalPool);
            emit GroupBuyFulfilled(bundleId);
        }
    }
    
    function refundGroupBuy(bytes32 bundleId, address buyer) external {
        GroupBuyBundle storage bundle = groupBuys[bundleId];
        require(block.timestamp > bundle.deadline, "Deadline not passed");
        require(!bundle.isFulfilled, "Bundle was fulfilled");
        require(groupBuyCommitments[bundleId][buyer], "Not committed");
        
        groupBuyCommitments[bundleId][buyer] = false;
        payable(buyer).transfer(bundle.pricePerSlot);
    }
}
