const { ethers, run, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\n🚀 Oui Market Contract Deployment");
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
  // STEP 1: Deploy OuiScore
  // ────────────────────────────────────────────────────
  console.log("1️⃣  Deploying OuiScore...");
  const OuiScore = await ethers.getContractFactory("OuiScore");
  const ouiScore = await OuiScore.deploy();
  await ouiScore.waitForDeployment();
  const ouiScoreAddress = await ouiScore.getAddress();
  console.log(`   ✅ OuiScore deployed: ${ouiScoreAddress}`);

  // ────────────────────────────────────────────────────
  // STEP 2: Deploy OuiEscrow
  // ────────────────────────────────────────────────────
  console.log("\n2️⃣  Deploying OuiEscrow...");
  const OuiEscrow = await ethers.getContractFactory("OuiEscrow");
  const escrow = await OuiEscrow.deploy(
    CNGN_ADDRESS,
    ouiScoreAddress,
    TREASURY
  );
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`   ✅ OuiEscrow deployed: ${escrowAddress}`);

  // ────────────────────────────────────────────────────
  // STEP 3: Authorize OuiEscrow to write to OuiScore
  // ────────────────────────────────────────────────────
  console.log("\n3️⃣  Authorizing OuiEscrow on OuiScore...");
  const tx = await ouiScore.authorizeContract(escrowAddress);
  await tx.wait();
  console.log(`   ✅ OuiEscrow authorized to write scores`);

  // ────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`OuiScore:   ${ouiScoreAddress}`);
  console.log(`OuiEscrow:  ${escrowAddress}`);
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
      OuiScore:  ouiScoreAddress,
      OuiEscrow: escrowAddress,
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
      console.log("   Verifying OuiScore...");
      await run("verify:verify", {
        address: ouiScoreAddress,
        constructorArguments: [],
      });

      console.log("   Verifying OuiEscrow...");
      await run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [CNGN_ADDRESS, ouiScoreAddress, TREASURY],
      });
      console.log("   ✅ Both contracts verified on block explorer");
    } catch (err) {
      console.log("   ⚠️  Verification failed (may already be verified):", err.message);
    }
  }

  console.log("\n✅ Deployment complete. Oui Market is live.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
