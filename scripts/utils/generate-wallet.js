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
  console.log("- Use apenas em ambiente seguro e com baixo saldo operacional");
  console.log("\n💰 Para operar na Polygon:");
  console.log("1. Envie POL para o endereço acima");
  console.log("2. Use saldo para taxas de rede (gas)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error(error); process.exit(1); });
