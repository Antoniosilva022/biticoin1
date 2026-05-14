---
applyTo: "contracts/**/*.sol,test/**/*.js"
description: "Use quando editar contrato Solidity, regra de tokenomics, mensagens de revert ou comportamento de taxa, vesting e pause. Exige compile e testes no mesmo fluxo."
---

# Solidity + Tests Guardrail

## Objetivo

Manter contrato e testes sincronizados em toda mudanca de comportamento.

## Fluxo Obrigatorio

1. Fazer a menor alteracao possivel em [contracts/Biticoin.sol](../../contracts/Biticoin.sol).
2. Se houver mudanca de comportamento, atualizar ou criar testes em [test/Biticoin.test.js](../../test/Biticoin.test.js) e/ou [test/VulnerabilityAudit.test.js](../../test/VulnerabilityAudit.test.js) na mesma tarefa.
3. Executar:
   - `npm run compile`
   - `npm run test`
4. Se mensagens de revert mudarem, ajustar as expectativas correspondentes nos testes.

## Regras Especificas do Projeto

- Preservar estilo atual de Solidity (`pragma ^0.8.20`, OpenZeppelin v5).
- Nao alterar constantes de tokenomics sem solicitacao explicita.
- Manter semantica de `_update` compativel com validacoes de pause e logica de taxa.

## Criterio de Conclusao

- Compile executa com sucesso.
- Testes relevantes passam.
- Mudancas de comportamento ficam cobertas explicitamente por testes.
