import { ethers } from "ethers";

const TOKEN_ENV_BY_NETWORK = {
  mainnet: "TOKEN_ADDRESS_MAINNET",
  sepolia: "TOKEN_ADDRESS_SEPOLIA",
  polygon: "TOKEN_ADDRESS_POLYGON",
  polygonAmoy: "TOKEN_ADDRESS_AMOY",
  localhost: "TOKEN_ADDRESS_LOCALHOST",
  hardhat: "TOKEN_ADDRESS_LOCALHOST"
};

export function resolveTokenAddress(networkName) {
  const networkEnvVar = TOKEN_ENV_BY_NETWORK[networkName];
  const networkTokenAddress = networkEnvVar ? process.env[networkEnvVar] : undefined;
  const fallbackTokenAddress = process.env.TOKEN_ADDRESS;
  const tokenAddress = networkTokenAddress || fallbackTokenAddress;

  if (!tokenAddress) {
    const hint = networkEnvVar
      ? `${networkEnvVar} (recomendado para ${networkName}) ou TOKEN_ADDRESS`
      : "TOKEN_ADDRESS";
    throw new Error(`Defina ${hint} no .env`);
  }

  if (!ethers.isAddress(tokenAddress)) {
    const sourceVar = networkTokenAddress ? networkEnvVar : "TOKEN_ADDRESS";
    throw new Error(`Endereco de token invalido em ${sourceVar}: ${tokenAddress}`);
  }

  return {
    tokenAddress,
    sourceEnvVar: networkTokenAddress ? networkEnvVar : "TOKEN_ADDRESS"
  };
}
