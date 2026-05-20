import hre from "hardhat";
const { ethers } = hre;

async function main() {
  if (hre.network.name !== "polygon") {
    console.error("❌ Operação bloqueada: este repositório está em modo Polygon-only.");
    console.error("   Use scripts com --network polygon.");
    process.exit(1);
  }

  console.log("🚀 Deploy na Polygon Amoy (testnet)...\n");

  const provider = new ethers.JsonRpcProvider(
    process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology"
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📋 Carteira:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  const balanceInPol = parseFloat(ethers.formatEther(balance));
  console.log("💰 Saldo:", balanceInPol, "AmoyPOL");

  if (balanceInPol < 0.1) {
    console.log(`\n❌ Saldo insuficiente: ${balanceInPol} AmoyPOL`);
    console.log("💡 Pegue tokens de teste em: https://faucet.polygon.technology/");
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

  console.log("\n🎉 DEPLOY CONCLUÍDO NA POLYGON AMOY!");
  console.log("📋 Endereço do contrato:", address);
  console.log("💰 Total Supply:", ethers.formatEther(totalSupply), "BITI");
  console.log("🔍 Explorer: https://amoy.polygonscan.com/address/" + address);

  console.log("\n📝 Próximos passos:");
  console.log("1. Atualize TOKEN_ADDRESS no .env com:", address);
  console.log("2. Rode: npm run transfer:90:amoy");
  console.log("3. Verifique o contrato: npm run verify:amoy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
