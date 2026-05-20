import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const { ethers } = hre;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientRpcError(error) {
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("temporary internal error") ||
    msg.includes("could not coalesce error") ||
    msg.includes("timeout") ||
    msg.includes("429")
  );
}

async function waitForReceiptWithRetry(provider, txHash, maxAttempts = 40, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt) return receipt;
    } catch (error) {
      if (!isTransientRpcError(error)) throw error;
      console.log(`⚠️  RPC instável ao buscar receipt (tentativa ${attempt}/${maxAttempts}).`);
    }

    await sleep(delayMs);
  }

  throw new Error("Timeout aguardando confirmação do deploy.");
}

async function main() {
  if (hre.network.name !== "polygon") {
    console.error("❌ Operação bloqueada: este repositório está em modo Polygon-only.");
    console.error("   Use scripts com --network polygon.");
    process.exit(1);
  }

  console.log("🚀 [1/4] Deploy na Mainnet Ethereum...\n");

  const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📋 Carteira:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  const balanceInEth = parseFloat(ethers.formatEther(balance));
  console.log("💰 Saldo:", balanceInEth, "ETH");
  if (balanceInEth < 0.01) {
    console.log(`\n❌ Saldo insuficiente: ${balanceInEth} ETH`);
    process.exit(1);
  }

  // Deploy do contrato usando a wallet do .env como signer
  const Biticoin = await ethers.getContractFactory("Biticoin", wallet);
  const biticoin = await Biticoin.deploy();
  const deployTx = biticoin.deploymentTransaction();
  if (!deployTx?.hash) {
    throw new Error("Não foi possível obter o hash da transação de deploy.");
  }

  console.log("⏳ Aguardando confirmação na blockchain...");
  console.log("🔗 Tx deploy:", deployTx.hash);
  const receipt = await waitForReceiptWithRetry(provider, deployTx.hash);
  if (Number(receipt.status) !== 1) {
    throw new Error("Deploy falhou em blockchain (status != 1).");
  }

  const address = await biticoin.getAddress();
  const totalSupply = await biticoin.totalSupply();
  console.log("\n🎉 DEPLOY CONCLUÍDO NA MAINNET!");
  console.log("📋 Endereço do contrato:", address);
  console.log("💰 Total Supply:", ethers.formatEther(totalSupply), "BITI");
  console.log("🔍 Etherscan: https://etherscan.io/address/" + address);

  // Atualiza TOKEN_ADDRESS no .env (opcional: instrução para o usuário)
  console.log("\n⚠️  Atualize o .env: TOKEN_ADDRESS=" + address);

  // [2/4] Transferir 90% do saldo disponível para MetaMask
  const recipient = process.env.RECIPIENT_ADDRESS;
  if (!recipient) {
    console.log("❌ RECIPIENT_ADDRESS não definido no .env");
    process.exit(1);
  }

  // Recriar instância explicitamente para garantir ABI e signer corretos
  const artifact = await hre.artifacts.readArtifact("Biticoin");
  const token = new ethers.Contract(address, artifact.abi, wallet);

  const ownerBalance = await token.balanceOf(wallet.address);
  const amount90 = ownerBalance * 90n / 100n;
  console.log("\n🚚 [2/4] Transferindo 90% do saldo para:", recipient);
  console.log("   Valor:", ethers.formatEther(amount90), "BITI");
  const tx = await token["transfer(address,uint256)"](recipient, amount90);
  await tx.wait();
  console.log("✅ Transferência concluída! Hash:", tx.hash);

  // [3/4] Verificar contrato no Etherscan
  console.log("\n🔎 [3/4] Verificando contrato no Etherscan...");
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: []
    });
    console.log("✅ Contrato verificado!");
    console.log("🔗 https://etherscan.io/address/" + address + "#code");
  } catch (e) {
    console.log("⚠️  Falha na verificação automática. Verifique manualmente se necessário.");
  }

  // [4/4] Instrução para liquidez
  console.log("\n💧 [4/4] Adicione liquidez no Uniswap:");
  console.log("   npm run liquidity:mainnet");
}

main().catch((error) => {
  console.error("❌ Erro:", error.message || error);
  process.exit(1);
});
