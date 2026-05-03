import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🔑 Gerando nova carteira Ethereum...\n");

  const wallet = ethers.Wallet.createRandom();

  console.log("📋 Endereço da carteira:", wallet.address);
  console.log("🔑 Chave privada:", wallet.privateKey);
  console.log("\n⚠️  IMPORTANTE:");
  console.log("- Guarde esta chave privada em local seguro!");
  console.log("- Nunca compartilhe com ninguém!");
  console.log("- Use apenas para testes em testnet");
  console.log("\n💰 Para obter SepoliaETH:");
  console.log("1. Vá para: https://sepoliafaucet.com");
  console.log("2. Cole o endereço acima");
  console.log("3. Solicite ~0.5 ETH para cobrir gas fees");
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error(error); process.exit(1); });
