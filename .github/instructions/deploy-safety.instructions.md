---
applyTo: "scripts/deploy/**/*.js,scripts/utils/**/*.js,hardhat.config.js"
description: "Use quando editar scripts de deploy, verify, liquidez, transferencia ou configuracao de rede. Exige validacao de env vars, passagem por testnet e confirmacao explicita para acoes de mainnet."
---

# Deploy Safety Guardrail

## Objetivo

Evitar comandos destrutivos ou caros em operacoes de rede.

## Checklist Obrigatorio Antes de Sugerir Execucao

1. Confirmar variaveis de ambiente exigidas no script alvo e em [.env.example](../../.env.example).
2. Priorizar testnet primeiro (sepolia ou polygonAmoy) antes de qualquer operacao em mainnet.
3. Exigir confirmacao explicita do usuario antes de comandos que movam fundos ou tokens.
4. Declarar rede alvo de forma explicita na resposta.

## Comandos de Alto Risco

- `npm run deploy:mainnet`
- `npm run deploy:polygon`
- `npm run launch:mainnet:auto`
- `npm run transfer:90:main`
- `npm run transfer:90:polygon`

## Armadilhas Conhecidas do Projeto

- Verify em redes Polygon exige `POLYGONSCAN_API_KEY` (validado em [scripts/utils/verify.js](../../scripts/utils/verify.js)).
- O fluxo send-90-percent e destrutivo com destinatario incorreto.
- Preservar retry em [scripts/deploy/launch-mainnet.js](../../scripts/deploy/launch-mainnet.js) para falhas transientes de RPC.

## Criterio de Conclusao

- Alteracoes mantem mensagens de erro claras e consciencia de rede.
- Etapas com impacto em mainnet nunca sao assumidas automaticamente.
- A resposta final sempre inclui precondicoes, comando e validacao posterior.
