// Exibe informações completas do contrato deployado
// Uso: npx hardhat run scripts/utils/info.js --network polygon
//      npx hardhat run scripts/utils/info.js --network mainnet
//
// Requer no .env: TOKEN_ADDRESS=0xEnderecoDoContrato

import hre from "hardhat";
const { ethers } = hre;
import { resolveTokenAddress } from "./token-address.js";

async function main() {
  const { tokenAddress, sourceEnvVar } = resolveTokenAddress(hre.network.name);

  const token = await ethers.getContractAt("Biticoin", tokenAddress);
  const [signer] = await ethers.getSigners();

  console.log("📊 ══════════════════════════════════════");
  console.log("       BITICOIN (BITI) — Info do Contrato");
  console.log("══════════════════════════════════════\n");

  const [name, symbol, decimals, totalSupply, maxSupply, owner,
         paused, feeBps, feeRecipient, vestingReleased, vestingAmount, vestingTime] =
    await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply(),
      token.MAX_SUPPLY(),
      token.owner(),
      token.paused(),
      token.transferFeeBps(),
      token.feeRecipient(),
      token.vestingReleased(),
      token.vestingAmount(),
      token.vestingReleaseTime(),
    ]);

  const ownerBalance = await token.balanceOf(owner);

  const vestingDate = new Date(Number(vestingTime) * 1000).toLocaleDateString("pt-BR");

  console.log(`📋 Endereço:       ${tokenAddress}`);
  console.log(`🌐 Rede:           ${hre.network.name}`);
  console.log(`🧭 Env utilizado:  ${sourceEnvVar}`);
  console.log(`🔤 Nome:           ${name} (${symbol})`);
  console.log(`🔢 Decimais:       ${decimals}`);
  console.log(`💰 Total Supply:   ${ethers.formatEther(totalSupply)} BITI`);
  console.log(`🔒 Supply Máximo:  ${ethers.formatEther(maxSupply)} BITI`);
  console.log(`👤 Owner:          ${owner}`);
  console.log(`💼 Saldo Owner:    ${ethers.formatEther(ownerBalance)} BITI`);
  console.log(`⏸  Pausado:        ${paused ? "SIM ⚠️" : "Não"}`);
  console.log(`💸 Taxa atual:     ${Number(feeBps) / 100}%`);
  console.log(`📬 Dest. da taxa:  ${feeRecipient}`);
  console.log(`\n🔐 Vesting (20% founder):`);
  console.log(`   Valor:          ${ethers.formatEther(vestingAmount)} BITI`);
  console.log(`   Liberação:      ${vestingDate}`);
  console.log(`   Liberado:       ${vestingReleased ? "Sim ✅" : "Não (ainda travado)"}`);

  const explorerBase = hre.network.name === "mainnet"
    ? `https://etherscan.io/address/${tokenAddress}`
    : hre.network.name === "polygon"
        ? `https://polygonscan.com/address/${tokenAddress}`
        : hre.network.name === "polygonAmoy"
          ? `https://amoy.polygonscan.com/address/${tokenAddress}`
          : `https://polygonscan.com/address/${tokenAddress}`;
  console.log(`\n🔍 Explorer:       ${explorerBase}`);
  console.log("\n══════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
