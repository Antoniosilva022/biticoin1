import hre from "hardhat";
import dotenv from "dotenv";
import { resolveTokenAddress } from "./token-address.js";
dotenv.config();

const { ethers } = hre;

// Uniswap V2 Router (mainnet e testnets compatíveis)
const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const ROUTER_ABI = [
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function WETH() external pure returns (address)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

async function main() {
  if (hre.network.name !== "polygon") {
    console.error("❌ Operação bloqueada: este script está em modo Polygon-only.");
    console.error("   Use: --network polygon");
    process.exit(1);
  }

  const { tokenAddress, sourceEnvVar } = resolveTokenAddress(hre.network.name);

  // Quantidade de BITI a adicionar como liquidez (padrão: 1 bilhão)
  const BITI_AMOUNT = process.env.LIQUIDITY_BITI_AMOUNT || "1000000000";
  // Quantidade de ETH a adicionar como liquidez (padrão: 0.01 ETH)
  const ETH_AMOUNT  = process.env.LIQUIDITY_ETH_AMOUNT  || "0.01";

  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;

  console.log("💧 Adicionando liquidez no Uniswap V2...\n");
  console.log("📋 Carteira:      ", deployer.address);
  console.log("🪙 Token (BITI):  ", tokenAddress);
  console.log("🧭 Env utilizado: ", sourceEnvVar);
  console.log("🌐 Rede:          ", network);
  console.log("💎 BITI a depositar:", Number(BITI_AMOUNT).toLocaleString("pt-BR"), "BITI");
  console.log("💰 ETH a depositar:", ETH_AMOUNT, "ETH\n");

  // Evita falso positivo: se o endereço não tem bytecode, não existe router nessa rede.
  const routerCode = await deployer.provider.getCode(UNISWAP_V2_ROUTER);
  if (routerCode === "0x") {
    console.error("❌ Uniswap V2 Router não encontrado nesta rede.");
    console.error("   Endereço configurado:", UNISWAP_V2_ROUTER);
    console.error("   Dica: crie pool direto no app.uniswap.org (V3/V4) para Sepolia.");
    process.exit(1);
  }

  // Checar saldo ETH
  const ethBalance = await deployer.provider.getBalance(deployer.address);
  const ethNeeded  = ethers.parseEther(ETH_AMOUNT);
  if (ethBalance < ethNeeded) {
    console.error(`❌ Saldo ETH insuficiente!`);
    console.error(`   Necessário: ${ETH_AMOUNT} ETH`);
    console.error(`   Disponível: ${ethers.formatEther(ethBalance)} ETH`);
    process.exit(1);
  }

  const token  = new ethers.Contract(tokenAddress, ERC20_ABI, deployer);
  const router = new ethers.Contract(UNISWAP_V2_ROUTER, ROUTER_ABI, deployer);

  const decimals    = await token.decimals();
  const tokenAmount = ethers.parseUnits(BITI_AMOUNT, decimals);

  // Checar saldo BITI
  const bitiBalance = await token.balanceOf(deployer.address);
  if (bitiBalance < tokenAmount) {
    console.error(`❌ Saldo BITI insuficiente!`);
    console.error(`   Necessário: ${BITI_AMOUNT} BITI`);
    console.error(`   Disponível: ${ethers.formatUnits(bitiBalance, decimals)} BITI`);
    process.exit(1);
  }

  // Passo 1: Aprovar o router para gastar BITI
  const allowance = await token.allowance(deployer.address, UNISWAP_V2_ROUTER);
  if (allowance < tokenAmount) {
    console.log("🔐 Aprovando BITI para o Uniswap Router...");
    const approveTx = await token.approve(UNISWAP_V2_ROUTER, tokenAmount);
    await approveTx.wait();
    console.log("✅ Aprovação confirmada — tx:", approveTx.hash);
  } else {
    console.log("✅ Aprovação já existente, pulando...");
  }

  // Passo 2: Adicionar liquidez
  // amountTokenMin e amountETHMin com 1% de slippage
  const slippage        = 100n; // 1% = 100/10000
  const tokenAmountMin  = tokenAmount - (tokenAmount * slippage / 10000n);
  const ethAmountMin    = ethNeeded   - (ethNeeded   * slippage / 10000n);
  const deadline        = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutos

  console.log("\n🚀 Enviando transação de liquidez...");
  const tx = await router.addLiquidityETH(
    tokenAddress,
    tokenAmount,
    tokenAmountMin,
    ethAmountMin,
    deployer.address, // recebe os tokens LP
    deadline,
    { value: ethNeeded }
  );

  console.log("⏳ Aguardando confirmação... tx:", tx.hash);
  const receipt = await tx.wait();

  console.log("\n✅ Liquidez adicionada com sucesso!");
  console.log("📦 Bloco:", receipt.blockNumber);
  console.log("🔗 Ver no Etherscan:");
  if (network === "mainnet") {
    console.log(`   https://etherscan.io/tx/${tx.hash}`);
    console.log(`\n🦄 Par no Uniswap:`);
    console.log(`   https://app.uniswap.org/#/swap?outputCurrency=${tokenAddress}`);
  } else {
    console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
  }
}

main().catch((err) => {
  console.error("❌ Erro:", err.message || err);
  process.exit(1);
});
