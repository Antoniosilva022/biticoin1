async function main() {
  console.error("❌ Script legado desativado: launch-sepolia.js não é compatível com o modo Polygon-only.");
  console.error("   Para validar em testnet, use npm run deploy:amoy seguido de npm run verify:amoy e npm run transfer:90:amoy.");
  process.exit(1);
}

main().catch((error) => {
  console.error("❌ Erro:", error.message || error);
  process.exit(1);
});
