import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const configs = {
    mainnet: {
      label: "mainnet",
      rpcUrl: process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com",
      symbol: "ETH",
      minBalance: 0.01,
      fundingHint: "💡 Deposite ETH via Binance, Coinbase, etc."
    },
    polygon: {
      label: "polygon",
      rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com",
      symbol: "MATIC",
      minBalance: 1,
      fundingHint: "💡 Deposite MATIC via Binance, Coinbase, etc."
    },
    polygonAmoy: {
      label: "polygonAmoy",
      rpcUrl: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      symbol: "AmoyPOL",
      minBalance: 0.1,
      fundingHint: "💡 Faucet: https://faucet.polygon.technology/"
    }
  };

  const network = configs[hre.network.name] || configs.polygon;

  console.log(`💰 Verificando saldo na rede: ${network.label}\n`);

  const provider = new ethers.JsonRpcProvider(network.rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📋 Endereço:", wallet.address);

  try {
    const balance = await provider.getBalance(wallet.address);
    const formattedBalance = ethers.formatEther(balance);

    console.log(`💰 Saldo: ${formattedBalance} ${network.symbol}`);

    if (parseFloat(formattedBalance) < network.minBalance) {
      console.log("\n❌ Saldo insuficiente para deploy!");
      console.log(network.fundingHint);
      console.log("📋 Endereço:", wallet.address);
    } else {
      console.log("\n✅ Saldo suficiente para deploy!");
    }
  } catch (error) {
    console.error("❌ Erro ao verificar saldo:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error); process.exit(1); });
