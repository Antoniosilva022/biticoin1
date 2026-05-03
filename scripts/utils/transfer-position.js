// Transfere posição de liquidez Uniswap V3 (NFT) do deployer para a MetaMask
import hre from "hardhat";
const { ethers } = hre;

const POS_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

const NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const recipient = process.env.RECIPIENT_ADDRESS;

  console.log("🔍 Buscando posições do deployer...");
  console.log("📋 De:", wallet.address);
  console.log("📬 Para:", recipient);

  const nft = new ethers.Contract(POS_MANAGER, NFT_ABI, wallet);

  const balance = await nft.balanceOf(wallet.address);
  console.log(`\n📦 Total de posições encontradas: ${balance}`);

  if (balance === 0n) {
    console.log("❌ Nenhuma posição encontrada no deployer.");
    process.exit(1);
  }

  for (let i = 0n; i < balance; i++) {
    const tokenId = await nft.tokenOfOwnerByIndex(wallet.address, i);
    console.log(`\n🎫 Posição #${tokenId} — transferindo...`);
    const tx = await nft.transferFrom(wallet.address, recipient, tokenId);
    await tx.wait();
    console.log(`✅ Posição #${tokenId} transferida!`);
    console.log(`🔗 Tx: https://polygonscan.com/tx/${tx.hash}`);
  }

  console.log("\n🎉 Todas as posições transferidas para a MetaMask!");
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
