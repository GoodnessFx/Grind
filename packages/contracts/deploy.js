const { ethers, run, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\n🚀 Grind Market Contract Deployment");
  console.log("═══════════════════════════════════════");
  console.log(`Network:   ${network.name}`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(`Balance:   ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  // ── Required env vars ──
  const CNGN_ADDRESS = process.env.CNGN_TOKEN_ADDRESS;
  const TREASURY     = process.env.TREASURY_ADDRESS;

  if (!CNGN_ADDRESS || !TREASURY) {
    throw new Error("Missing env vars: CNGN_TOKEN_ADDRESS and TREASURY_ADDRESS required");
  }

  // ────────────────────────────────────────────────────
  // STEP 1: Deploy GrindScore
  // ────────────────────────────────────────────────────
  console.log("1️⃣  Deploying GrindScore...");
  const GrindScore = await ethers.getContractFactory("GrindScore");
  const grindScore = await GrindScore.deploy();
  await grindScore.waitForDeployment();
  const grindScoreAddress = await grindScore.getAddress();
  console.log(`   ✅ GrindScore deployed: ${grindScoreAddress}`);

  // ────────────────────────────────────────────────────
  // STEP 2: Deploy GrindEscrow
  // ────────────────────────────────────────────────────
  console.log("\n2️⃣  Deploying GrindEscrow...");
  const GrindEscrow = await ethers.getContractFactory("GrindEscrow");
  const escrow = await GrindEscrow.deploy(
    CNGN_ADDRESS,
    grindScoreAddress,
    TREASURY
  );
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`   ✅ GrindEscrow deployed: ${escrowAddress}`);

  // ────────────────────────────────────────────────────
  // STEP 3: Deploy GrindInstallmentEscrow
  // ────────────────────────────────────────────────────
  console.log("\n3️⃣  Deploying GrindInstallmentEscrow...");
  const GrindInstallmentEscrow = await ethers.getContractFactory("GrindInstallmentEscrow");
  const installmentEscrow = await GrindInstallmentEscrow.deploy();
  await installmentEscrow.waitForDeployment();
  const installmentEscrowAddress = await installmentEscrow.getAddress();
  console.log(`   ✅ GrindInstallmentEscrow deployed: ${installmentEscrowAddress}`);

  // ────────────────────────────────────────────────────
  // STEP 4: Authorize GrindEscrow to write to GrindScore
  // ────────────────────────────────────────────────────
  console.log("\n4️⃣  Authorizing GrindEscrow on GrindScore...");
  const tx = await grindScore.authorizeContract(escrowAddress);
  await tx.wait();
  console.log(`   ✅ GrindEscrow authorized to write scores`);

  // ────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`GrindScore:   ${grindScoreAddress}`);
  console.log(`GrindEscrow:  ${escrowAddress}`);
  console.log(`Installment:  ${installmentEscrowAddress}`);
  console.log(`cNGN token: ${CNGN_ADDRESS}`);
  console.log(`Treasury:   ${TREASURY}`);
  console.log("═══════════════════════════════════════\n");

  // Save to file for frontend use
  const fs = require("fs");
  const deploymentData = {
    network:    network.name,
    chainId:    (await ethers.provider.getNetwork()).chainId.toString(),
    deployer:   deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      GrindScore:  grindScoreAddress,
      GrindEscrow: escrowAddress,
      GrindInstallmentEscrow: installmentEscrowAddress,
      cNGN:      CNGN_ADDRESS,
      treasury:  TREASURY,
    }
  };

  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(
    `./deployments/${network.name}.json`,
    JSON.stringify(deploymentData, null, 2)
  );
  console.log(`💾 Deployment saved to ./deployments/${network.name}.json`);

  // ────────────────────────────────────────────────────
  // STEP 4: Verify on block explorer (if not local)
  // ────────────────────────────────────────────────────
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n4️⃣  Waiting 30s before verification...");
    await new Promise(r => setTimeout(r, 30_000));

    try {
      console.log("   Verifying GrindScore...");
      await run("verify:verify", {
        address: grindScoreAddress,
        constructorArguments: [],
      });

      console.log("   Verifying GrindEscrow...");
      await run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [CNGN_ADDRESS, grindScoreAddress, TREASURY],
      });
      console.log("   ✅ Both contracts verified on block explorer");
    } catch (err) {
      console.log("   ⚠️  Verification failed (may already be verified):", err.message);
    }
  }

  console.log("\n✅ Deployment complete. Grind Market is live.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
