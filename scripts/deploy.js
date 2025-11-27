const hre = require("hardhat");

async function main() {
  // Deploy RoleManager first
  const RoleManager = await hre.ethers.getContractFactory("RoleManager");
  const roleManager = await RoleManager.deploy();

  await roleManager.waitForDeployment();
  const roleManagerAddress = await roleManager.getAddress();
  console.log("RoleManager deployed at:", roleManagerAddress);

  // Deploy EvidenceRegistry with RoleManager address
  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const evidenceRegistry = await EvidenceRegistry.deploy(roleManagerAddress);

  await evidenceRegistry.waitForDeployment();
  const evidenceRegistryAddress = await evidenceRegistry.getAddress();
  console.log("EvidenceRegistry deployed at:", evidenceRegistryAddress);
}

// Hardhat standard pattern
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
