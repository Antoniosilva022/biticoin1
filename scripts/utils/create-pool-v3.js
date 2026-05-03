// Cria pool Uniswap V3 na Polygon com preço correto via script
// Uso: npm run pool:polygon
import hre from "hardhat";
const { ethers } = hre;

// Uniswap V3 na Polygon
const FACTORY_V3  = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const POS_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const WMATIC      = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const FEE         = 10000; // 1%
const TICK_SPACING = 200;
const MIN_TICK = -887200; // múltiplo de 200
const MAX_TICK =  887200;

const FACTORY_ABI = [
  "function getPool(address,address,uint24) view returns (address)",
  "function createPool(address,address,uint24) returns (address)"
];
const POOL_ABI = [
  "function initialize(uint160 sqrtPriceX96) external",
  "function slot0() view returns (uint160,int24,uint16,uint16,uint16,uint8,bool)"
];
const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)"
];
const PM_ABI = [
  "function mint((address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint256 amount0Desired,uint256 amount1Desired,uint256 amount0Min,uint256 amount1Min,address recipient,uint256 deadline)) external payable returns (uint256,uint128,uint256,uint256)"
];

// Calcula sqrtPriceX96 usando BigInt puro (sem perda de precisão)
function sqrtBigInt(n) {
  if (n === 0n) return 0n;
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
}

function getSqrtPriceX96(price) {
  // price = token1 per token0 (BITI per WMATIC), ambos 18 decimais
  // sqrtPriceX96 = sqrt(price) * 2^96 = sqrt(price * 2^192)
  const Q192 = 2n ** 192n;
  return sqrtBigInt(BigInt(price) * Q192);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const BITI     = process.env.TOKEN_ADDRESS;

  console.log("🚀 Criando pool Uniswap V3 na Polygon...");
  console.log("📋 Carteira:", wallet.address);
  console.log("📍 BITI:", BITI);

  // Ordem dos tokens (obrigatória: menor endereço = token0)
  const [token0, token1] = WMATIC.toLowerCase() < BITI.toLowerCase()
    ? [WMATIC, BITI]
    : [BITI, WMATIC];

  // Preço: queremos 1 WMATIC = 1.000.000.000 BITI
  // Se WMATIC=token0, BITI=token1 → price = 1e9
  // Se BITI=token0, WMATIC=token1 → price = 1/1e9 (invertido)
  const isMatic0 = token0.toLowerCase() === WMATIC.toLowerCase();
  const price    = isMatic0 ? 1_000_000_000 : 1; // ajustado abaixo se invertido
  const sqrtPriceX96 = isMatic0
    ? getSqrtPriceX96(1_000_000_000)
    : getSqrtPriceX96(1); // 1/1e9 → usamos 1 e depois checamos

  console.log("🔢 token0:", token0);
  console.log("🔢 token1:", token1);
  console.log("📈 sqrtPriceX96:", sqrtPriceX96.toString());

  const factory = new ethers.Contract(FACTORY_V3, FACTORY_ABI, wallet);

  // Verificar se pool já existe
  let poolAddress = await factory.getPool(token0, token1, FEE);
  console.log("\n📍 Pool existente:", poolAddress);

  if (poolAddress === ethers.ZeroAddress) {
    console.log("⏳ Criando pool...");
    const tx = await factory.createPool(token0, token1, FEE);
    await tx.wait();
    poolAddress = await factory.getPool(token0, token1, FEE);
    console.log("✅ Pool criado:", poolAddress);
  }

  // Verificar se pool já está inicializado
  const pool  = new ethers.Contract(poolAddress, POOL_ABI, wallet);
  const slot0 = await pool.slot0();
  const currentSqrtPrice = slot0[0];

  if (currentSqrtPrice === 0n) {
    console.log("⏳ Inicializando pool com preço correto...");
    const tx = await pool.initialize(sqrtPriceX96);
    await tx.wait();
    console.log("✅ Pool inicializado com sqrtPriceX96:", sqrtPriceX96.toString());
  } else {
    console.log("ℹ️  Pool já inicializado. sqrtPriceX96 atual:", currentSqrtPrice.toString());
  }

  // Adicionar liquidez via Position Manager
  const biti = new ethers.Contract(BITI, ERC20_ABI, wallet);
  const bitiBalance = await biti.balanceOf(wallet.address);
  console.log("\n💰 Saldo BITI na carteira deployer:", ethers.formatEther(bitiBalance));

  // Usar 10 milhões de BITI para liquidez
  const bitiAmount = ethers.parseEther("10000000"); // 10 milhões BITI
  const maticAmount = ethers.parseEther("5");        // 5 MATIC

  if (bitiBalance < bitiAmount) {
    console.log("❌ Saldo BITI insuficiente na carteira deployer.");
    console.log("💡 Transfira BITI da MetaMask para:", wallet.address);
    process.exit(1);
  }

  // Aprovar BITI para o Position Manager
  console.log("⏳ Aprovando BITI para o Position Manager...");
  const approveTx = await biti.approve(POS_MANAGER, bitiAmount);
  await approveTx.wait();
  console.log("✅ BITI aprovado!");

  // Montar parâmetros de mint
  const amount0Desired = isMatic0 ? maticAmount : bitiAmount;
  const amount1Desired = isMatic0 ? bitiAmount  : maticAmount;

  const params = {
    token0,
    token1,
    fee: FEE,
    tickLower: MIN_TICK,
    tickUpper: MAX_TICK,
    amount0Desired,
    amount1Desired,
    amount0Min: 0n,
    amount1Min: 0n,
    recipient: wallet.address,
    deadline: (await provider.getBlock("latest")).timestamp + 3600
  };

  const posManager = new ethers.Contract(POS_MANAGER, PM_ABI, wallet);

  console.log("⏳ Adicionando liquidez...");
  const mintValue = isMatic0 ? maticAmount : 0n;
  const mintTx = await posManager.mint(params, { value: mintValue });
  const receipt = await mintTx.wait();
  console.log("✅ Liquidez adicionada!");
  console.log("🔗 Tx:", receipt.hash);
  console.log("🔍 Ver em: https://polygonscan.com/tx/" + receipt.hash);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
