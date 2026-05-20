import hre from "hardhat";
const { ethers } = hre;

async function main() {
  if (hre.network.name !== "polygon") {
    console.error("❌ Operação bloqueada: este repositório está em modo Polygon-only.");
    console.error("   Use scripts com --network polygon.");
    process.exit(1);
  }

  console.log("🚀 Deploy na Sepolia Testnet...\n");

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📋 Carteira:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  const balanceInEth = parseFloat(ethers.formatEther(balance));
  console.log("💰 Saldo:", balanceInEth, "SepoliaETH");

  if (balanceInEth < 0.01) {
    console.log("\n❌ Saldo insuficiente!");
    console.log("💡 Obtenha SepoliaETH em: https://sepoliafaucet.com");
    console.log("📋 Endereço:", wallet.address);
    process.exit(1);
  }

  console.log("✅ Saldo OK!\n");

  const Biticoin = await ethers.getContractFactory("Biticoin");
  const biticoin = await Biticoin.deploy();

  console.log("⏳ Aguardando confirmação...");
  await biticoin.waitForDeployment();

  const address = await biticoin.getAddress();
  const totalSupply = await biticoin.totalSupply();

  console.log("\n🎉 Deploy concluído!");
  console.log("📋 Endereço do contrato:", address);
  console.log("💰 Total Supply:", ethers.formatEther(totalSupply), "BITI");
  console.log("🔍 Etherscan: https://sepolia.etherscan.io/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
