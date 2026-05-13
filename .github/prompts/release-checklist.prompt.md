---
description: "Generate a release readiness checklist for this Hardhat token project, including compile/test, env validation, verification readiness, and per-network go/no-go gates."
mode: ask
---

# Release Checklist

You are preparing a release checklist for this repository.

## Inputs

- Target network: `${input:network:sepolia|mainnet|polygonAmoy|polygon}`
- Release type: `${input:releaseType:testnet|mainnet|patch-script|contract-change}`
- Include liquidity step: `${input:includeLiquidity:yes|no}`

## Tasks

1. Build a concise go/no-go checklist grouped by:
   - Code quality gates (compile/tests)
   - Environment and keys
   - Deploy and verify steps
   - Post-deploy validation
2. Use project scripts from [package.json](../../package.json) when suggesting commands.
3. Call out high-risk operations and explicit confirmations needed.
4. Mention known pitfalls from [AUDIT_REPORT.md](../../AUDIT_REPORT.md) and [AGENTS.md](../../AGENTS.md).

## Output Format

- Section 1: Release Summary (network, risk level, required approvals)
- Section 2: Pre-flight Checklist
- Section 3: Execution Plan (commands only from this repo)
- Section 4: Post-release Validation
- Section 5: Rollback/Contingency Notes
