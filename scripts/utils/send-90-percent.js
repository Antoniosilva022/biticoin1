import hre from "hardhat";
const { ethers } = hre;
import { resolveTokenAddress } from "./token-address.js";

async function main() {
  if (hre.network.name !== "polygon") {
    console.error("❌ Operação bloqueada: este script está em modo Polygon-only.");
    console.error("   Use: --network polygon");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const tokenAddressArg = args[0];
  const recipient = process.env.RECIPIENT_ADDRESS || args[1];
  let tokenAddress = tokenAddressArg;
  let sourceEnvVar = "CLI_ARG";

  if (!tokenAddress) {
    const resolved = resolveTokenAddress(hre.network.name);
    tokenAddress = resolved.tokenAddress;
    sourceEnvVar = resolved.sourceEnvVar;
  } else if (!ethers.isAddress(tokenAddress)) {
    console.error("❌ Endereço do token inválido no argumento:", tokenAddress);
    process.exit(1);
  }

  if (!tokenAddress || !recipient) {
    console.error("Uso: npx hardhat run scripts/utils/send-90-percent.js --network <rede>");
    console.error("Defina TOKEN_ADDRESS_<REDE> (ou TOKEN_ADDRESS) e RECIPIENT_ADDRESS no .env");
    process.exit(1);
  }

  console.log("📦 Enviando 90% do saldo BITI para:", recipient);
  console.log("📍 Token:", tokenAddress);
  console.log("🧭 Endereço resolvido via:", sourceEnvVar);

  const [owner] = await ethers.getSigners();
  const token = await ethers.getContractAt("Biticoin", tokenAddress, owner);

  const balance = await token.balanceOf(owner.address);
  if (balance === 0n) {
    console.error("❌ Saldo do dono é zero. Não há tokens para enviar.");
    process.exit(1);
  }

  const amount = (balance * 90n) / 100n;

  console.log("🔢 Saldo total:", ethers.formatEther(balance), "BITI");
  console.log("✉️  Enviando (90%):", ethers.formatEther(amount), "BITI");

  const tx = await token.transfer(recipient, amount);
  console.log("⏳ Transação enviada. Hash:", tx.hash);
  await tx.wait();

  console.log("✅ Transferência concluída!");
  console.log("📋 90% enviado para:", recipient);
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message || error); process.exit(1); });
