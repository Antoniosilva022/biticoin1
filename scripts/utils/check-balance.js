import { network } from "hardhat";

async function main() {
  const connection = await network.create();
  const { ethers, networkName } = connection;

  const configs = {
    mainnet: {
      label: "mainnet",
      symbol: "ETH",
      minBalance: "0.01",
      fundingHint: "💡 Deposite ETH via Binance, Coinbase, etc."
    },
    polygon: {
      label: "polygon",
      symbol: "POL",
      minBalance: "1",
      fundingHint: "💡 Deposite POL via Binance, Coinbase, etc."
    },
    polygonAmoy: {
      label: "polygonAmoy",
      symbol: "AmoyPOL",
      minBalance: "0.1",
      fundingHint: "💡 Faucet: https://faucet.polygon.technology/"
    }
  };

  const config = configs[networkName];

  if (!config) {
    throw new Error(`Rede não suportada para consulta de saldo: ${networkName}`);
  }

  if (networkName === "polygon" && (await ethers.provider.getNetwork()).chainId !== 137n) {
    throw new Error("A rede conectada não é Polygon Mainnet. Consulta interrompida.");
  }

  if (networkName === "polygonAmoy" && (await ethers.provider.getNetwork()).chainId !== 80002n) {
    throw new Error("A rede conectada não é Polygon Amoy. Consulta interrompida.");
  }

  const [wallet] = await ethers.getSigners();

  if (!wallet) {
    throw new Error("Nenhuma carteira configurada. Defina PRIVATE_KEY no .env.");
  }

  const address = await wallet.getAddress();
  const balance = await ethers.provider.getBalance(address);
  const formattedBalance = ethers.formatEther(balance);

  console.log(`💰 Verificando saldo na rede: ${config.label}\n`);
  console.log("📋 Endereço:", address);
  console.log(`💰 Saldo: ${formattedBalance} ${config.symbol}`);

  if (balance < ethers.parseEther(config.minBalance)) {
    console.log("\n❌ Saldo insuficiente para deploy!");
    console.log(config.fundingHint);
    console.log("📋 Endereço:", address);
  } else {
    console.log("\n✅ Saldo suficiente para deploy!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error); process.exit(1); });
