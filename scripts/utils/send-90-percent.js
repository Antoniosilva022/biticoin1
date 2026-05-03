import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const args = process.argv.slice(2);
  const tokenAddress = process.env.TOKEN_ADDRESS || args[0];
  const recipient = process.env.RECIPIENT_ADDRESS || args[1];

  if (!tokenAddress || !recipient) {
    console.error("Uso: npx hardhat run scripts/utils/send-90-percent.js --network <rede>");
    console.error("Defina TOKEN_ADDRESS e RECIPIENT_ADDRESS no .env");
    process.exit(1);
  }

  console.log("📦 Enviando 90% do saldo BITI para:", recipient);
  console.log("📍 Token:", tokenAddress);

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
