---
applyTo: "contracts/**/*.sol,test/**/*.js"
description: "Use when: editar contrato Solidity, alterar regra de negocio de tokenomics, mudar revert messages ou ajustar comportamento de taxa/vesting/pause. Obriga compile e testes relacionados."
---

# Solidity + Tests Guardrail

## Objective

Keep contract and tests in sync for every behavior change.

## Required Workflow

1. Make the smallest possible change in [contracts/Biticoin.sol](../../contracts/Biticoin.sol).
2. Update or add tests in [test/Biticoin.test.js](../../test/Biticoin.test.js) and/or [test/VulnerabilityAudit.test.js](../../test/VulnerabilityAudit.test.js) in the same task when behavior changes.
3. Run:
   - `npm run compile`
   - `npm run test`
4. If revert strings changed, update matching expectations in tests.

## Project-Specific Notes

- Preserve Solidity style already used (`pragma ^0.8.20`, OpenZeppelin v5).
- Do not alter tokenomics constants unless explicitly requested.
- Keep `_update` override semantics compatible with pause checks and fee logic.

## Done Criteria

- Compile succeeds.
- Relevant tests pass.
- Behavior changes are explicitly covered by tests.
