# AGENTS Guide

This repository is a Hardhat + Ethers v6 project for the `Biticoin` ERC-20 token.

## Start Here

- Install dependencies: `npm install`
- Compile contracts: `npm run compile`
- Run tests: `npm run test`

Read existing docs first, do not duplicate them:

- Project usage and deploy flows: [README.md](README.md)
- Security findings and risk notes: [AUDIT_REPORT.md](AUDIT_REPORT.md)

## Scope And Key Paths

- Smart contract: `contracts/Biticoin.sol`
- Tests: `test/Biticoin.test.js`, `test/VulnerabilityAudit.test.js`
- Deploy scripts: `scripts/deploy/*.js`
- Utility scripts: `scripts/utils/*.js`
- Generated outputs (do not edit): `artifacts/`, `cache/`

## Project Conventions

- Use ESM only (`"type": "module"`): prefer `import`, never `require`.
- Hardhat config is ESM in `hardhat.config.js`.
- Keep Solidity at `^0.8.20` style and OpenZeppelin v5 patterns already used.
- Preserve revert message text expected by tests.
- Prefer updating npm scripts in `package.json` instead of ad-hoc shell instructions.

## Safe Agent Behavior

- Never print or commit secrets from `.env`.
- Treat `deploy:mainnet`, `deploy:polygon`, `launch:mainnet:auto`, and transfer scripts as high-risk.
- Before suggesting mainnet actions, require testnet validation (`sepolia` or `polygonAmoy`) and successful `npm run test`.
- Do not change tokenomics-related constants in `contracts/Biticoin.sol` unless explicitly requested.

## Task Playbooks

### Contract change

1. Edit `contracts/Biticoin.sol` minimally.
2. Run `npm run compile`.
3. Run `npm run test`.
4. If behavior changed, update tests under `test/` in the same task.

### Script change

1. Keep ESM pattern used across `scripts/deploy/` and `scripts/utils/`.
2. Keep explicit network handling and clear error output.
3. Validate related command(s) from `package.json`.

### Verification/deploy support

1. Confirm required env vars from `.env.example` and script checks.
2. Keep explorer logic aligned with target network in `scripts/utils/verify.js`.
3. Never assume mainnet execution without explicit user confirmation.

## Known Pitfalls

- `scripts/utils/verify.js` requires `POLYGONSCAN_API_KEY` for Polygon networks.
- `scripts/utils/send-90-percent.js` moves a large owner balance and is destructive if recipient is wrong.
- `scripts/deploy/launch-mainnet.js` includes RPC retry logic; preserve this resilience pattern.