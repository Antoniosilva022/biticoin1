---
applyTo: "scripts/deploy/**/*.js,scripts/utils/**/*.js,hardhat.config.js"
description: "Use when: editar scripts de deploy/verify/liquidity/transfer ou configuracao de rede. Exige checklist de env vars, validacao em testnet e confirmacao explicita para mainnet."
---

# Deploy Safety Checklist

## Objective

Prevent destructive or costly mistakes when running network operations.

## Mandatory Checks Before Suggesting Execution

1. Confirm required environment variables for the target script in [.env.example](../../.env.example) and script guards.
2. Prefer testnet first (`sepolia` or `polygonAmoy`) before any mainnet operation.
3. Require explicit user confirmation before commands that can move funds or tokens.

## High-Risk Commands

- `npm run deploy:mainnet`
- `npm run deploy:polygon`
- `npm run launch:mainnet:auto`
- `npm run transfer:90:main`
- `npm run transfer:90:polygon`

## Project-Specific Pitfalls

- Verification on Polygon family needs `POLYGONSCAN_API_KEY` (checked in [scripts/utils/verify.js](../../scripts/utils/verify.js)).
- `send-90-percent` is destructive with wrong recipient.
- Keep retry behavior in [scripts/deploy/launch-mainnet.js](../../scripts/deploy/launch-mainnet.js) for transient RPC failures.

## Done Criteria

- Script changes preserve clear error output and network awareness.
- Mainnet-impacting steps are never auto-assumed.
