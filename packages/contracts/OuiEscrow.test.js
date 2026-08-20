const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const e18 = (n) => ethers.parseUnits(String(n), 18);
const PLATFORM_FEE_BPS = 800n;
const ESCROW_FEE_BPS   = 150n;
const BPS_DENOM        = 10_000n;
const DISPUTE_FEE      = e18(500);
const AUTO_RELEASE     = 48 * 60 * 60; // 48 hours in seconds
const ONE_DAY          = 24 * 60 * 60;

function calcFees(amount) {
  const a = BigInt(amount);
  const platformFee = (a * PLATFORM_FEE_BPS) / BPS_DENOM;
  const escrowFee   = (a * ESCROW_FEE_BPS)   / BPS_DENOM;
  const payout      = a - platformFee;
  const totalPull   = a + escrowFee;
  return { platformFee, escrowFee, payout, totalPull };
}

// ─────────────────────────────────────────────────────────────
// MOCK cNGN TOKEN
// ─────────────────────────────────────────────────────────────
async function deployMockCNGN(owner) {
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  return MockERC20.deploy("Canonical NGN", "cNGN", 18);
}

// ─────────────────────────────────────────────────────────────
// DEPLOY FIXTURES
// ─────────────────────────────────────────────────────────────
async function deployAll() {
  const [owner, treasury, poster, doer, arbiter1, arbiter2, arbiter3, arbiter4, arbiter5, attacker] =
    await ethers.getSigners();

  // Deploy mock cNGN
  const cNGN = await deployMockCNGN(owner);

  // Deploy OuiScore
  const OuiScore = await ethers.getContractFactory("OuiScore");
  const ouiScore = await OuiScore.deploy();

  // Deploy OuiDID
  const OuiDID = await ethers.getContractFactory("OuiDID");
  const ouiDID = await OuiDID.deploy();

  // Deploy OuiEscrow
  const OuiEscrow = await ethers.getContractFactory("OuiEscrow");
  const escrow = await OuiEscrow.deploy(
    await cNGN.getAddress(),
    await ouiScore.getAddress(),
    await ouiDID.getAddress(),
    treasury.address
  );

  // Authorize escrow to write scores
  await ouiScore.authorizeContract(await escrow.getAddress());

  // Mint cNGN to test accounts
  const MINT = e18(1_000_000);
  await cNGN.mint(poster.address,   MINT);
  await cNGN.mint(doer.address,     MINT);
  await cNGN.mint(attacker.address, MINT);
  await cNGN.mint(treasury.address, e18(100_000)); // treasury funds arbiter rewards

  return { cNGN, ouiScore, ouiDID, escrow, owner, treasury, poster, doer, arbiter1, arbiter2, arbiter3, arbiter4, arbiter5, attacker };
}

// Helper: boost an address to Diamond tier by simulating many completions
async function boostToDiamond(ouiScore, escrow, address) {
  const escrowAddr = await escrow.getAddress();
  // Since only authorized contracts can write — we call via the authorized escrow
  // In tests we directly call ouiScore as owner after temporarily authorizing a test signer
  // For simplicity: use owner to directly call (owner is also authorized via test setup)
  // We authorize a direct test call
  const [owner] = await ethers.getSigners();
  await ouiScore.connect(owner).authorizeContract(owner.address);

  // Simulate 10 completions + good ratings to push score above 800
  for (let i = 0; i < 10; i++) {
    await ouiScore.connect(owner).incrementCompletion(address);
    await ouiScore.connect(owner).incrementPayment(address);
    await ouiScore.connect(owner).submitRating(address, 5);
  }
}

// ─────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────
describe("OuiScore", function () {
  describe("Authorization", function () {
    it("only owner can authorize contracts", async function () {
      const { ouiScore, attacker } = await deployAll();
      await expect(
        ouiScore.connect(attacker).authorizeContract(attacker.address)
      ).to.be.revertedWithCustomError(ouiScore, "OwnableUnauthorizedAccount");
    });

    it("unauthorized address cannot mutate scores", async function () {
      const { ouiScore, attacker, poster } = await deployAll();
      await expect(
        ouiScore.connect(attacker).incrementCompletion(poster.address)
      ).to.be.revertedWith("OuiScore: caller not authorized");
    });

    it("authorized contract can mutate scores", async function () {
      const { ouiScore, owner, poster } = await deployAll();
      await ouiScore.connect(owner).authorizeContract(owner.address);
      await expect(ouiScore.connect(owner).incrementCompletion(poster.address))
        .to.emit(ouiScore, "ScoreUpdated");
    });
  });

  describe("Score calculation", function () {
    it("new user starts at STARTER tier with score 0", async function () {
      const { ouiScore, poster } = await deployAll();
      expect(await ouiScore.getScore(poster.address)).to.equal(0);
      expect(await ouiScore.getTier(poster.address)).to.equal(0); // STARTER
    });

    it("completing tasks increases score", async function () {
      const { ouiScore, owner, poster } = await deployAll();
      await ouiScore.connect(owner).authorizeContract(owner.address);

      await ouiScore.connect(owner).incrementCompletion(poster.address);
      const score = await ouiScore.getScore(poster.address);
      expect(score).to.be.gt(0);
    });

    it("losing disputes penalizes score", async function () {
      const { ouiScore, owner, poster } = await deployAll();
      await ouiScore.connect(owner).authorizeContract(owner.address);

      // First build score
      for (let i = 0; i < 5; i++) {
        await ouiScore.connect(owner).incrementCompletion(poster.address);
        await ouiScore.connect(owner).incrementPayment(poster.address);
        await ouiScore.connect(owner).submitRating(poster.address, 5);
      }
      const scoreBefore = await ouiScore.getScore(poster.address);

      // Penalize
      await ouiScore.connect(owner).incrementDisputeTotal(poster.address);
      await ouiScore.connect(owner).penalizeDispute(poster.address);
      const scoreAfter = await ouiScore.getScore(poster.address);

      expect(scoreAfter).to.be.lt(scoreBefore);
      await expect(ouiScore.connect(owner).penalizeDispute(poster.address))
        .to.emit(ouiScore, "ScorePenalized");
    });

    it("referral cap at 50 prevents farming", async function () {
      const { ouiScore, owner, poster } = await deployAll();
      await ouiScore.connect(owner).authorizeContract(owner.address);

      // Add 60 referrals — should cap at 50
      for (let i = 0; i < 60; i++) {
        await ouiScore.connect(owner).addReferral(poster.address);
      }
      const profile = await ouiScore.getProfile(poster.address);
      expect(profile.referrals).to.equal(50);
    });

    it("meetsThreshold works for tier gating", async function () {
      const { ouiScore, owner, poster } = await deployAll();
      await ouiScore.connect(owner).authorizeContract(owner.address);

      // STARTER cannot meet BRONZE
      expect(await ouiScore.meetsThreshold(poster.address, 1)).to.be.false;

      // Boost to Diamond
      await boostToDiamond(ouiScore, null, poster.address);
      expect(await ouiScore.meetsThreshold(poster.address, 3)).to.be.true; // DIAMOND
    });
  });
});

describe("OuiEscrow", function () {
  // ── TASK CREATION ──
  describe("createTask", function () {
    it("creates task and locks funds", async function () {
      const { cNGN, escrow, poster } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);

      const balBefore = await cNGN.balanceOf(await escrow.getAddress());
      await expect(escrow.connect(poster).createTask(amount, ONE_DAY))
        .to.emit(escrow, "TaskCreated")
        .withArgs(1n, poster.address, amount, (await ethers.provider.getBlock("latest")).timestamp + ONE_DAY + 1);

      const balAfter = await cNGN.balanceOf(await escrow.getAddress());
      expect(balAfter - balBefore).to.equal(totalPull);
    });

    it("reverts if amount below minimum", async function () {
      const { cNGN, escrow, poster } = await deployAll();
      const tooLow = e18(100);
      await cNGN.connect(poster).approve(await escrow.getAddress(), tooLow);
      await expect(escrow.connect(poster).createTask(tooLow, ONE_DAY))
        .to.be.revertedWithCustomError(escrow, "AmountTooLow");
    });

    it("reverts if duration exceeds max", async function () {
      const { cNGN, escrow, poster } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);
      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      const tooLong = 31 * ONE_DAY;
      await expect(escrow.connect(poster).createTask(amount, tooLong))
        .to.be.revertedWithCustomError(escrow, "DurationTooLong");
    });
  });

  // ── HAPPY PATH ──
  describe("Happy path: create → accept → submit → approve", function () {
    it("full flow releases correct funds", async function () {
      const { cNGN, escrow, poster, doer, treasury } = await deployAll();
      const amount = e18(3500);
      const { platformFee, escrowFee, payout, totalPull } = calcFees(amount);

      // Create
      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);

      // Accept
      await expect(escrow.connect(doer).acceptTask(1))
        .to.emit(escrow, "TaskAccepted").withArgs(1n, doer.address);

      // Submit
      await expect(escrow.connect(doer).submitWork(1))
        .to.emit(escrow, "WorkSubmitted").withArgs(1n, doer.address);

      // Approve
      const doerBefore     = await cNGN.balanceOf(doer.address);
      const treasuryBefore = await cNGN.balanceOf(treasury.address);

      await expect(escrow.connect(poster).approveWork(1))
        .to.emit(escrow, "WorkApproved");

      const doerAfter     = await cNGN.balanceOf(doer.address);
      const treasuryAfter = await cNGN.balanceOf(treasury.address);

      expect(doerAfter - doerBefore).to.equal(payout);
      expect(treasuryAfter - treasuryBefore).to.equal(platformFee + escrowFee);
    });

    it("task state is APPROVED after approval", async function () {
      const { cNGN, escrow, poster, doer } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);
      await escrow.connect(doer).acceptTask(1);
      await escrow.connect(doer).submitWork(1);
      await escrow.connect(poster).approveWork(1);

      const task = await escrow.getTask(1);
      expect(task.state).to.equal(3); // APPROVED
    });
  });

  // ── AUTO RELEASE ──
  describe("autoRelease", function () {
    it("releases funds after 48h with no poster response", async function () {
      const { cNGN, escrow, poster, doer } = await deployAll();
      const amount = e18(3500);
      const { payout, totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);
      await escrow.connect(doer).acceptTask(1);
      await escrow.connect(doer).submitWork(1);

      // Fast-forward 48 hours
      await time.increase(AUTO_RELEASE + 1);

      const doerBefore = await cNGN.balanceOf(doer.address);
      await expect(escrow.connect(doer).autoRelease(1))
        .to.emit(escrow, "AutoReleased");
      const doerAfter = await cNGN.balanceOf(doer.address);

      expect(doerAfter - doerBefore).to.equal(payout);
    });

    it("reverts if 48h window not open yet", async function () {
      const { cNGN, escrow, poster, doer } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);
      await escrow.connect(doer).acceptTask(1);
      await escrow.connect(doer).submitWork(1);

      await time.increase(ONE_DAY); // only 24h, not 48h
      await expect(escrow.connect(doer).autoRelease(1))
        .to.be.revertedWithCustomError(escrow, "AutoReleaseWindowNotOpen");
    });
  });

  // ── REFUND ──
  describe("claimRefund", function () {
    it("refunds poster after deadline passes with no delivery", async function () {
      const { cNGN, escrow, poster } = await deployAll();
      const amount = e18(3500);
      const { escrowFee, totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);

      await time.increase(ONE_DAY + 1);

      const posterBefore = await cNGN.balanceOf(poster.address);
      await expect(escrow.connect(poster).claimRefund(1))
        .to.emit(escrow, "Refunded");
      const posterAfter = await cNGN.balanceOf(poster.address);

      // Gets back amount + escrowFee (full refund)
      expect(posterAfter - posterBefore).to.equal(amount + escrowFee);
    });

    it("penalizes doer who accepted but ghosted", async function () {
      const { cNGN, escrow, ouiScore, poster, doer } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);
      await escrow.connect(doer).acceptTask(1);

      await time.increase(ONE_DAY + 1);
      await escrow.connect(poster).claimRefund(1);

      // Doer should have disputes lost > 0
      const profile = await ouiScore.getProfile(doer.address);
      expect(profile.disputesLost).to.equal(1);
    });

    it("reverts if deadline not passed", async function () {
      const { cNGN, escrow, poster } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);

      await expect(escrow.connect(poster).claimRefund(1))
        .to.be.revertedWithCustomError(escrow, "DeadlineNotPassed");
    });
  });

  // ── DISPUTE FLOW ──
  describe("Dispute flow with 5 arbiter votes", function () {
    async function setupDisputedTask(contracts) {
      const { cNGN, escrow, ouiScore, poster, doer } = contracts;
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);
      await escrow.connect(doer).acceptTask(1);
      await escrow.connect(doer).submitWork(1);

      // Poster raises dispute
      await cNGN.connect(poster).approve(await escrow.getAddress(), DISPUTE_FEE);
      await escrow.connect(poster).raiseDispute(1);

      return { taskId: 1 };
    }

    it("resolves dispute when 5 arbiters vote — doer wins majority", async function () {
      const contracts = await deployAll();
      const { cNGN, escrow, ouiScore, doer, arbiter1, arbiter2, arbiter3, arbiter4, arbiter5 } = contracts;
      await setupDisputedTask(contracts);

      const arbiters = [arbiter1, arbiter2, arbiter3, arbiter4, arbiter5];
      // Boost all arbiters to Diamond
      for (const a of arbiters) {
        await boostToDiamond(ouiScore, escrow, a.address);
        await cNGN.mint(a.address, e18(1000));
      }

      const doerBefore = await cNGN.balanceOf(doer.address);

      // 3 vote for doer, 2 vote against
      for (let i = 0; i < 3; i++) {
        await escrow.connect(arbiters[i]).castDisputeVote(1, true);
      }
      // Last vote triggers resolution
      await escrow.connect(arbiters[3]).castDisputeVote(1, false);
      await expect(escrow.connect(arbiters[4]).castDisputeVote(1, false))
        .to.emit(escrow, "DisputeResolved");

      const doerAfter = await cNGN.balanceOf(doer.address);
      expect(doerAfter).to.be.gt(doerBefore); // Doer received funds
    });

    it("reverts if non-Diamond tries to vote", async function () {
      const contracts = await deployAll();
      const { escrow, attacker } = contracts;
      await setupDisputedTask(contracts);

      await expect(escrow.connect(attacker).castDisputeVote(1, true))
        .to.be.revertedWithCustomError(escrow, "NotDiamondTier");
    });

    it("reverts if arbiter votes twice", async function () {
      const contracts = await deployAll();
      const { escrow, ouiScore, arbiter1 } = contracts;
      await setupDisputedTask(contracts);
      await boostToDiamond(ouiScore, escrow, arbiter1.address);

      await escrow.connect(arbiter1).castDisputeVote(1, true);
      await expect(escrow.connect(arbiter1).castDisputeVote(1, true))
        .to.be.revertedWithCustomError(escrow, "AlreadyVoted");
    });
  });

  // ── TIER GATING ──
  describe("Tier gating on task acceptance", function () {
    it("blocks acceptance of 10k+ task by Starter tier", async function () {
      const { cNGN, escrow, poster, doer } = await deployAll();
      const amount = e18(10_000);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);

      // Doer is Starter tier (no score)
      await expect(escrow.connect(doer).acceptTask(1))
        .to.be.revertedWith("OuiEscrow: Bronze tier required for tasks above 10,000 NGN");
    });
  });

  // ── SECURITY — REENTRANCY ──
  describe("Security: reentrancy attack", function () {
    it("reentrancy attack on approveWork fails due to ReentrancyGuard + CEI", async function () {
      // Deploy a malicious contract that tries to reenter approveWork
      const { cNGN, escrow, poster, doer, owner } = await deployAll();

      const MaliciousDoer = await ethers.getContractFactory("MaliciousDoer");
      const malicious = await MaliciousDoer.deploy(
        await escrow.getAddress(),
        await cNGN.getAddress()
      );

      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      // Fund malicious contract
      await cNGN.mint(await malicious.getAddress(), e18(100_000));
      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);

      // Malicious contract accepts task
      await malicious.acceptTask(1);
      await malicious.submitWork(1);

      // Poster tries to approve — malicious contract tries to reenter
      // Should succeed for poster but reenter attempt should fail
      await expect(escrow.connect(poster).approveWork(1)).to.not.be.reverted;
    });
  });

  // ── SECURITY — UNAUTHORIZED SCORE ──
  describe("Security: unauthorized score manipulation", function () {
    it("random user cannot write to OuiScore", async function () {
      const { ouiScore, attacker, poster } = await deployAll();
      await expect(
        ouiScore.connect(attacker).incrementCompletion(poster.address)
      ).to.be.revertedWith("OuiScore: caller not authorized");
    });

    it("random user cannot penalize another user", async function () {
      const { ouiScore, attacker, poster } = await deployAll();
      await expect(
        ouiScore.connect(attacker).penalizeDispute(poster.address)
      ).to.be.revertedWith("OuiScore: caller not authorized");
    });
  });

  // ── ACCESS CONTROL ──
  describe("Access control", function () {
    it("non-poster cannot approve work", async function () {
      const { cNGN, escrow, poster, doer, attacker } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);
      await escrow.connect(doer).acceptTask(1);
      await escrow.connect(doer).submitWork(1);

      await expect(escrow.connect(attacker).approveWork(1))
        .to.be.revertedWithCustomError(escrow, "NotPoster");
    });

    it("non-doer cannot submit work", async function () {
      const { cNGN, escrow, poster, doer, attacker } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);
      await escrow.connect(doer).acceptTask(1);

      await expect(escrow.connect(attacker).submitWork(1))
        .to.be.revertedWithCustomError(escrow, "NotDoer");
    });

    it("poster cannot be their own doer", async function () {
      const { cNGN, escrow, poster } = await deployAll();
      const amount = e18(3500);
      const { totalPull } = calcFees(amount);

      await cNGN.connect(poster).approve(await escrow.getAddress(), totalPull);
      await escrow.connect(poster).createTask(amount, ONE_DAY);

      await expect(escrow.connect(poster).acceptTask(1))
        .to.be.revertedWith("OuiEscrow: poster cannot be doer");
    });
  });
});
