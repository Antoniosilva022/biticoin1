import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🔧 Deploy local (Hardhat Network)...\n");

  const Biticoin = await ethers.getContractFactory("Biticoin");
  const biticoin = await Biticoin.deploy();
  await biticoin.waitForDeployment();

  const address = await biticoin.getAddress();
  const totalSupply = await biticoin.totalSupply();

  console.log("✅ Deploy concluído!");
  console.log("📋 Endereço:", address);
  console.log("💰 Total Supply:", ethers.formatEther(totalSupply), "BITI");
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error); process.exit(1); });
