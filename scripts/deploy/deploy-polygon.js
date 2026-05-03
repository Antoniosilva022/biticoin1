import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploy na Polygon Mainnet...\n");

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📋 Carteira:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  const balanceInMatic = parseFloat(ethers.formatEther(balance));
  console.log("💰 Saldo:", balanceInMatic, "MATIC");

  if (balanceInMatic < 1) {
    console.log(`\n❌ Saldo insuficiente: ${balanceInMatic} MATIC`);
    console.log("💡 Deposite pelo menos 2 MATIC nesta carteira:");
    console.log("📋", wallet.address);
    process.exit(1);
  }

  console.log("✅ Saldo OK! Iniciando deploy...\n");

  const Biticoin = await ethers.getContractFactory("Biticoin");
  const biticoin = await Biticoin.deploy();

  console.log("⏳ Aguardando confirmação na blockchain...");
  await biticoin.waitForDeployment();

  const address = await biticoin.getAddress();
  const totalSupply = await biticoin.totalSupply();

  console.log("\n🎉 DEPLOY CONCLUÍDO NA POLYGON!");
  console.log("📋 Endereço do contrato:", address);
  console.log("💰 Total Supply:", ethers.formatEther(totalSupply), "BITI");
  console.log("🔍 Polygonscan: https://polygonscan.com/address/" + address);

  console.log("\n📝 Próximos passos:");
  console.log("1. Atualize TOKEN_ADDRESS no .env com:", address);
  console.log("2. Rode: npm run transfer:90:polygon");
  console.log("3. Verifique o contrato: npm run verify:polygon");
  console.log("4. Adicione liquidez no Uniswap V3 (polygon)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
