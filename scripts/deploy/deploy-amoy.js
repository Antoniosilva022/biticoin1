
import { network } from "hardhat";

async function main() {
  if (process.env.CONFIRM_AMOY_DEPLOY !== "YES") {
    throw new Error("Deploy bloqueado: confirme CONFIRM_AMOY_DEPLOY=YES");
  }

  const { ethers } = await network.create();

  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error("Nenhuma carteira configurada para Polygon Amoy.");
  }

  const founder = deployer.address;
  const balance = await ethers.provider.getBalance(founder);

  console.log("Rede: Polygon Amoy");
  console.log("Carteira:", founder);
  console.log("Saldo:", ethers.formatEther(balance), "AmoyPOL");

  if (balance < ethers.parseEther("0.1")) {
    throw new Error("Saldo insuficiente de AmoyPOL.");
  }

  console.log("\nPreparando BITI 2.0...");

  const BiticoinV2 = await ethers.getContractFactory("BiticoinV2");

  const token = await BiticoinV2.deploy(founder);

  console.log("Aguardando confirmação...");
  await token.waitForDeployment();

  const address = await token.getAddress();

  console.log("\nBITI 2.0 PUBLICADA NA POLYGON AMOY!");
  console.log("Fundador:", await token.founder());
  console.log("Contrato:", address);
  console.log("Supply:", ethers.formatEther(await token.totalSupply()));
  console.log("Explorer:");
  console.log("https://amoy.polygonscan.com/address/" + address);
}

main().catch((error) => {
  console.error("Erro no deploy:", error);
  process.exitCode = 1;
});

