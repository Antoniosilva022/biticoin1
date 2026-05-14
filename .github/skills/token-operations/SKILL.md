---
name: token-operations
description: "Use quando executar operacoes recorrentes do token (deploy, verify, consulta, transferencia e liquidez) com validacoes de seguranca antes de comandos de risco."
---

# Token Operations Skill

## Objetivo

Fornecer um fluxo seguro e repetivel para operacoes do token BITI neste repositorio.

Documentos de referencia:

- [README.md](../../../README.md)
- [AUDIT_REPORT.md](../../../AUDIT_REPORT.md)
- [AGENTS.md](../../../AGENTS.md)

## Triggers

Use esta skill quando a solicitacao envolver:

- deploy token
- verify contract
- check token info
- transfer 90 percent
- add liquidity
- launch sepolia/mainnet

## Workflow

1. Identificar rede alvo e classificar risco (testnet vs mainnet).
2. Validar env vars e API keys obrigatorias antes de qualquer comando.
3. Executar o menor conjunto de comandos seguro para o objetivo.
4. Reportar resultado e proxima acao segura.

## Safe Command Sets

### Deploy (ordem preferencial)

- Local: `npm run deploy:local`
- Sepolia: `npm run deploy:sepolia`
- Amoy: `npm run deploy:amoy`
- Mainnet: somente com confirmacao explicita do usuario

### Verify

- Sepolia: `npm run verify:sepolia`
- Mainnet: `npm run verify:mainnet`
- Polygon: `npm run verify:amoy` ou `npm run verify:polygon` (exige `POLYGONSCAN_API_KEY`)

### Inspecao

- `npm run info:sepolia`
- `npm run info:mainnet`

### Transferencia e Liquidez (alto risco)

- Transfer 90%: `npm run transfer:90`, `npm run transfer:90:main`, `npm run transfer:90:polygon`
- Liquidity: `npm run liquidity:sepolia`, `npm run liquidity:mainnet`

## Required Safety Gates

- Nunca assumir intencao de mainnet sem confirmacao explicita.
- Avisar antes de operacoes destrutivas.
- Sempre listar env vars necessarias para o comando escolhido.
- Recomendar `npm run test` apos mudancas de codigo e antes de deploy.

## Output Contract

Toda resposta deve incluir:

1. Resumo do objetivo e rede selecionada
2. Checklist de precondicoes
3. Comandos para executar (nativos do repositorio)
4. Passos de validacao apos a execucao
