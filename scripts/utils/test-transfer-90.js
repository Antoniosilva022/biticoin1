import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [owner, recipient] = await ethers.getSigners();

  console.log("🔧 Deploy local para teste de transferência...\n");
  console.log("👤 Owner:    ", owner.address);
  console.log("📬 Recipient:", recipient.address);

  // Deploy do contrato
  const Biticoin = await ethers.getContractFactory("Biticoin");
  const token = await Biticoin.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("📋 Contrato: ", tokenAddress);

  // Saldo antes
  const totalSupply = await token.totalSupply();
  const ownerBefore = await token.balanceOf(owner.address);
  const recipientBefore = await token.balanceOf(recipient.address);

  console.log("\n📊 Saldos ANTES da transferência:");
  console.log("   Owner:    ", ethers.formatEther(ownerBefore), "BITI");
  console.log("   Recipient:", ethers.formatEther(recipientBefore), "BITI");
  console.log("   Total:    ", ethers.formatEther(totalSupply), "BITI");

  // Calcular 90%
  const amount = (ownerBefore * 90n) / 100n;
  console.log("\n✉️  Transferindo 90% =", ethers.formatEther(amount), "BITI...");

  const tx = await token.transfer(recipient.address, amount);
  await tx.wait();

  // Saldo depois
  const ownerAfter = await token.balanceOf(owner.address);
  const recipientAfter = await token.balanceOf(recipient.address);

  console.log("\n📊 Saldos DEPOIS da transferência:");
  console.log("   Owner:    ", ethers.formatEther(ownerAfter), "BITI  (10% restante)");
  console.log("   Recipient:", ethers.formatEther(recipientAfter), "BITI  (90% recebido)");

  // Validação
  const expectedAmount = (totalSupply * 90n) / 100n;
  const ok = recipientAfter === expectedAmount;
  console.log("\n" + (ok ? "✅ TESTE PASSOU!" : "❌ TESTE FALHOU!"));
  if (ok) {
    console.log("   Recipient recebeu exatamente 90% do supply total.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message || error); process.exit(1); });
