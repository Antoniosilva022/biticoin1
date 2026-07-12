async function main() {
  console.error("❌ Script legado desativado: deploy-mainnet.js não pode mais ser usado neste repositório.");
  console.error("   Use npm run deploy:polygon para produção ou npm run deploy:amoy para validação em testnet.");
  process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => { console.error("❌ Erro:", error.message); process.exit(1); });
