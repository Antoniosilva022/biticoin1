// Verifica o código-fonte do contrato no Etherscan após deploy
// Uso: npx hardhat run scripts/utils/verify.js --network sepolia
//      npx hardhat run scripts/utils/verify.js --network mainnet
//
// Requer no .env:
//   TOKEN_ADDRESS=0xEnderecoDoContrato
//   ETHERSCAN_API_KEY=suaChaveEtherscan

import hre from "hardhat";
import { resolveTokenAddress } from "./token-address.js";

async function main() {
  const { tokenAddress, sourceEnvVar } = resolveTokenAddress(hre.network.name);
  const isPolygonFamily = hre.network.name === "polygon" || hre.network.name === "polygonAmoy";
  const explorerBaseUrl = hre.network.name === "mainnet"
    ? "https://etherscan.io"
    : hre.network.name === "sepolia"
      ? "https://sepolia.etherscan.io"
      : hre.network.name === "polygon"
        ? "https://polygonscan.com"
        : "https://amoy.polygonscan.com";

  if (isPolygonFamily && !process.env.POLYGONSCAN_API_KEY && !process.env.ETHERSCAN_API_KEY) {
    console.error("❌ Defina POLYGONSCAN_API_KEY ou ETHERSCAN_API_KEY no .env");
    console.error("   Obtenha em: https://polygonscan.com/myapikey");
    process.exit(1);
  }

  if (!isPolygonFamily && !process.env.ETHERSCAN_API_KEY) {
    console.error("❌ Defina ETHERSCAN_API_KEY no .env");
    console.error("   Obtenha em: https://etherscan.io/myapikey");
    process.exit(1);
  }

  console.log("🔍 Verificando contrato no Etherscan...");
  console.log("📋 Endereço:", tokenAddress);
  console.log("🧭 Env utilizado:", sourceEnvVar);
  console.log("🌐 Rede:", hre.network.name);

  try {
    await hre.run("verify:verify", {
      address: tokenAddress,
      constructorArguments: [],
    });
    console.log("\n✅ Contrato verificado com sucesso!");
    const explorer = `${explorerBaseUrl}/address/${tokenAddress}#code`;
    console.log("🔗 Ver código:", explorer);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contrato já estava verificado!");
    } else {
      console.error("❌ Erro na verificação:", error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
