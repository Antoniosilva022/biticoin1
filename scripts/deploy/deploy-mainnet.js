import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploy na Mainnet Ethereum...\n");

  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📋 Carteira:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  const balanceInEth = parseFloat(ethers.formatEther(balance));
  console.log("💰 Saldo:", balanceInEth, "ETH");

  if (balanceInEth < 0.01) {
    console.log(`\n❌ Saldo insuficiente: ${balanceInEth} ETH`);
    console.log("💡 Deposite pelo menos 0.05 ETH nesta carteira via Binance / Coinbase:");
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

  console.log("\n🎉 DEPLOY CONCLUÍDO NA MAINNET!");
  console.log("📋 Endereço do contrato:", address);
  console.log("💰 Total Supply:", ethers.formatEther(totalSupply), "BITI");
  console.log("🔍 Etherscan: https://etherscan.io/address/" + address);

  console.log("\n📝 Próximos passos:");
  console.log("1. Verifique o contrato no Etherscan");
  console.log("2. Adicione liquidez no Uniswap");
  console.log("3. Divulgue o token (site, Discord, Twitter)");
  console.log("4. Aplique na Coinbase Asset Hub");
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
