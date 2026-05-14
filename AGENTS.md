# AGENTS Guide

Este repositorio usa Hardhat + Ethers v6 para o token ERC-20 Biticoin.

## Inicio Rapido

- Instalar dependencias: `npm install`
- Compilar contratos: `npm run compile`
- Executar testes: `npm run test`

Antes de propor qualquer mudanca, consulte a documentacao oficial do projeto:

- Fluxo de uso e deploy: [README.md](README.md)
- Riscos e achados de seguranca: [AUDIT_REPORT.md](AUDIT_REPORT.md)

## Escopo e Caminhos Principais

- Contrato principal: `contracts/Biticoin.sol`
- Testes: `test/Biticoin.test.js` e `test/VulnerabilityAudit.test.js`
- Scripts de deploy: `scripts/deploy/*.js`
- Scripts utilitarios: `scripts/utils/*.js`
- Saidas geradas (nao editar): `artifacts/` e `cache/`

## Convencoes do Projeto

- Projeto em ESM (`"type": "module"`): usar `import` e evitar `require`.
- Configuracao Hardhat em ESM: `hardhat.config.js`.
- Manter estilo Solidity em `^0.8.20` e padroes OpenZeppelin v5.
- Preservar mensagens de revert esperadas pelos testes.
- Preferir comandos via scripts de `package.json` em vez de comandos ad-hoc.

## Regras de Seguranca para Agentes

- Nunca expor ou commitar segredos de `.env`.
- Tratar comandos de mainnet e transferencia como alto risco:
	- `deploy:mainnet`
	- `deploy:polygon`
	- `launch:mainnet:auto`
	- scripts de transferencia
- Antes de qualquer orientacao para mainnet, exigir validacao em testnet (`sepolia` ou `polygonAmoy`) e `npm run test` com sucesso.
- Nao alterar constantes de tokenomics em `contracts/Biticoin.sol` sem pedido explicito.

## Playbooks de Tarefa

### Mudanca de contrato

1. Editar `contracts/Biticoin.sol` com alteracao minima.
2. Rodar `npm run compile`.
3. Rodar `npm run test`.
4. Se houver mudanca de comportamento, atualizar testes em `test/` na mesma tarefa.

### Mudanca de script

1. Preservar padrao ESM em `scripts/deploy/` e `scripts/utils/`.
2. Manter tratamento explicito de rede e mensagens de erro claras.
3. Validar o fluxo usando scripts existentes em `package.json`.

### Suporte a verify e deploy

1. Confirmar env vars obrigatorias em `.env.example` e nas validacoes do script.
2. Manter logica de explorer alinhada com a rede alvo em `scripts/utils/verify.js`.
3. Nunca assumir execucao em mainnet sem confirmacao explicita.

## Armadilhas Conhecidas

- `scripts/utils/verify.js` exige `POLYGONSCAN_API_KEY` para redes Polygon.
- `scripts/utils/send-90-percent.js` move uma parcela alta do saldo do owner e e destrutivo com destinatario incorreto.
- `scripts/deploy/launch-mainnet.js` contem retry de RPC; manter esse comportamento de resiliencia.