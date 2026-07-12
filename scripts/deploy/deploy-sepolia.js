async function main() {
  console.error("❌ Script legado desativado: deploy-sepolia.js não é compatível com o modo Polygon-only.");
  console.error("   Use npm run deploy:amoy para validação em testnet.");
  process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
