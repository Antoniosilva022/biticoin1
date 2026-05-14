---
description: "Gerar checklist de prontidao para release no projeto Hardhat, com gates de compile, teste, env, verify e decisao go/no-go por rede."
mode: ask
---

# Release Checklist

Voce esta preparando um checklist de release para este repositorio.

## Inputs

- Target network: `${input:network:sepolia|mainnet|polygonAmoy|polygon}`
- Release type: `${input:releaseType:testnet|mainnet|patch-script|contract-change}`
- Include liquidity step: `${input:includeLiquidity:yes|no}`

## Tasks

1. Montar um checklist objetivo de go/no-go agrupado por:
   - Qualidade de codigo (compile e testes)
   - Ambiente e chaves
   - Deploy e verify
   - Validacao pos-deploy
2. Sugerir apenas comandos existentes em [package.json](../../package.json).
3. Destacar operacoes de alto risco e confirmacoes explicitas necessarias.
4. Incluir alertas conhecidos de [AUDIT_REPORT.md](../../AUDIT_REPORT.md) e [AGENTS.md](../../AGENTS.md).

## Output Format

- Section 1: Release Summary (network, risk level, required approvals)
- Section 2: Pre-flight Checklist
- Section 3: Execution Plan (commands from this repo only)
- Section 4: Post-release Validation
- Section 5: Rollback and Contingency Notes
