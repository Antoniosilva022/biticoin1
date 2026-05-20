/**
 * deploy-and-transfer.js
 *
 * Faz deploy do contrato e envia automaticamente 90% dos tokens
 * para a carteira MetaMask definida em RECIPIENT_ADDRESS no .env
 *
 * Uso:
 *   Polygon:  npx hardhat run scripts/deploy/deploy-and-transfer.js --network polygon
 *
 * Variáveis obrigatórias no .env:
 *   PRIVATE_KEY         - chave privada do deployer
 *   RECIPIENT_ADDRESS   - endereço MetaMask que receberá os 90%
 *
 * Variáveis opcionais:
 *   ETHERSCAN_API_KEY   - para verificar o contrato automaticamente
 */

import hre from "hardhat";
const { ethers, network } = hre;

async function main() {
  if (hre.network.name !== "polygon") {
    console.error("❌ Operação bloqueada: este repositório está em modo Polygon-only.");
    console.error("   Use scripts com --network polygon.");
    process.exit(1);
  }

  const networkLabel = "Polygon Mainnet";
  const explorerBase = "https://polygonscan.com";

  // ── Validações ──────────────────────────────────────────────────
  const recipient = process.env.RECIPIENT_ADDRESS;
  if (!recipient) {
    console.error("❌ Defina RECIPIENT_ADDRESS no .env (endereço MetaMask)");
    process.exit(1);
  }
  if (!ethers.isAddress(recipient)) {
    console.error("❌ RECIPIENT_ADDRESS inválido:", recipient);
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════════");
  console.log(`  🚀 BITICOIN — Deploy + Transferência Automática`);
  console.log(`  🌐 Rede: ${networkLabel}`);
  console.log("═══════════════════════════════════════════════\n");

  // ── Verificar saldo de gas ──────────────────────────────────────
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  const ethBalanceFormatted = ethers.formatEther(ethBalance);
  const minRequired = 0.01;

  console.log("👤 Deployer:", deployer.address);
  console.log("📬 MetaMask:", recipient);
  console.log(`💰 Saldo:    ${ethBalanceFormatted} POL\n`);

  if (parseFloat(ethBalanceFormatted) < minRequired) {
    console.error(`❌ Saldo insuficiente! Mínimo: ${minRequired} POL`);
    console.error(`💡 Deposite POL no endereço: ${deployer.address}`);
    process.exit(1);
  }

  // ── ETAPA 1: Deploy ─────────────────────────────────────────────
  console.log("⏳ [1/4] Fazendo deploy do contrato...");

  const Biticoin = await ethers.getContractFactory("Biticoin");
  const token = await Biticoin.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  const totalSupply  = await token.totalSupply();

  console.log("✅ Deploy concluído!");
  console.log("📋 Contrato:", tokenAddress);
  console.log("💎 Supply:  ", ethers.formatEther(totalSupply), "BITI\n");

  // ── ETAPA 2: Calcular transferência ─────────────────────────────
  const ownerBalance = await token.balanceOf(deployer.address);
  const amount90     = (ownerBalance * 90n) / 100n;
  const amount10     = ownerBalance - amount90;

  console.log("⏳ [2/4] Calculando transferência...");
  console.log("   Saldo owner:     ", ethers.formatEther(ownerBalance), "BITI");
  console.log("   → MetaMask (90%):", ethers.formatEther(amount90), "BITI");
  console.log("   → Mantém (10%):  ", ethers.formatEther(amount10), "BITI\n");

  // ── ETAPA 3: Transferir 90% ──────────────────────────────────────
  console.log("⏳ [3/4] Enviando 90% para MetaMask...");
  const tx = await token.transfer(recipient, amount90);
  console.log("   Hash:", tx.hash);
  console.log(`   Ver: ${explorerBase}/tx/${tx.hash}`);
  await tx.wait();

  // Confirmar saldos finais
  const finalOwner     = await token.balanceOf(deployer.address);
  const finalRecipient = await token.balanceOf(recipient);

  console.log("\n✅ Transferência confirmada!");
  console.log("   MetaMask recebeu:", ethers.formatEther(finalRecipient), "BITI");
  console.log("   Owner retém:     ", ethers.formatEther(finalOwner), "BITI\n");

  // ── ETAPA 4: Verificar no explorer (se API key disponível) ───────
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("⏳ [4/4] Verificando contrato no Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [],
      });
      console.log("✅ Contrato verificado!");
    } catch (e) {
      if (e.message.includes("Already Verified")) {
        console.log("✅ Contrato já estava verificado!");
      } else {
        console.log("⚠️  Verificação falhou (pode tentar depois com npm run verify)");
      }
    }
  } else {
    console.log("ℹ️  [4/4] Verificação pulada (sem ETHERSCAN_API_KEY)");
    console.log("   Para verificar depois: npm run verify:polygon");
  }

  // ── Resumo final ─────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log("  🎉 CONCLUÍDO!");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Contrato:   ${explorerBase}/address/${tokenAddress}`);
  console.log(`  MetaMask:   ${explorerBase}/address/${recipient}`);
  console.log("\n  Para adicionar o BITI na MetaMask:");
  console.log("  1. Abra a MetaMask → Importar token");
  console.log("  2. Cole o endereço:", tokenAddress);
  console.log("  3. Símbolo: BITI | Decimais: 18");
  console.log("═══════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error.message || error);
    process.exit(1);
  });
