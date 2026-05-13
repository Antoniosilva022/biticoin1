---
name: token-operations
description: "Use when: executar operacoes repetitivas do token (deploy em testnet, verify, consulta de info, transferencia controlada e preparo de liquidez) com validacoes de seguranca antes de comandos de risco."
---

# Token Operations Skill

## Purpose

Provide a safe, repeatable workflow for BITI token operations in this repository.

Reference docs:

- [README.md](../../../README.md)
- [AUDIT_REPORT.md](../../../AUDIT_REPORT.md)
- [AGENTS.md](../../../AGENTS.md)

## Triggers

Use this skill when requests include:

- deploy token
- verify contract
- check token info
- transfer 90 percent
- add liquidity
- launch sepolia/mainnet

## Workflow

1. Identify target network and classify risk (testnet vs mainnet).
2. Validate required env vars and API keys before any command.
3. Run the minimum safe command set for the user goal.
4. Report outcomes and next safe action.

## Safe Command Sets

### Deploy (preferred order)

- Local: `npm run deploy:local`
- Sepolia: `npm run deploy:sepolia`
- Amoy: `npm run deploy:amoy`
- Mainnet: only with explicit user confirmation

### Verify

- Sepolia: `npm run verify:sepolia`
- Mainnet: `npm run verify:mainnet`
- Polygon family: `npm run verify:amoy` or `npm run verify:polygon` (requires `POLYGONSCAN_API_KEY`)

### Inspect

- `npm run info:sepolia`
- `npm run info:mainnet`

### Transfer / Liquidity (high risk)

- Transfer 90%: `npm run transfer:90`, `npm run transfer:90:main`, `npm run transfer:90:polygon`
- Liquidity: `npm run liquidity:sepolia`, `npm run liquidity:mainnet`

## Required Safety Gates

- Never assume mainnet intent without explicit confirmation.
- Warn before destructive operations.
- Always show which env vars are required for the selected command.
- Encourage running `npm run test` after code changes and before deploy flows.

## Output Contract

Every response should include:

1. Goal summary and selected network
2. Preconditions checklist
3. Commands to run (repo-native)
4. Validation steps after execution
