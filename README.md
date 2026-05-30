# Biticoin Token (BITI)

Uma criptomoeda ERC-20 baseada em conceitos do Bitcoin, com auditoria de segurança, vesting do fundador e operação protegida em Polygon.

## Modo Operacional Atual (Polygon-only)

- Scripts críticos de deploy/launch/transferência/liquidez estão bloqueados fora de `--network polygon`.
- Endereço oficial em produção (Polygon): `0xd7e0cef1511a7eef7fc57998214fb17a270a8b57`.
- Execuções em redes fora da Polygon foram desativadas por segurança operacional.

## Funcionalidades

- Supply inicial: 99 bilhões BITI (teto máximo: 110 bilhões)
- **80% liberado imediatamente** para o owner no deploy
- **20% em vesting** por 6 meses (fundador), liberado via `releaseVesting()`
- Taxa de transação configurável (0–5%)
- Minting controlado pelo owner (respeitando MAX_SUPPLY)
- Burning de tokens
- Pausar/despausar transferências em emergência
- Auditoria de segurança realizada (ver `AUDIT_REPORT.md`)
- Compatível com ERC-20 padrão (MetaMask, Uniswap, exchanges)

## Tokenomics

| Alocação           | Quantidade       | %    | Detalhe                        |
|--------------------|-----------------|------|--------------------------------|
| Circulação inicial | 79,2 bilhões    | 80%  | Transferido para MetaMask      |
| Vesting fundador   | 19,8 bilhões    | 20%  | Bloqueado 180 dias no contrato |
| **Total inicial**  | **99 bilhões**  | 100% |                                |
| Supply máximo      | 110 bilhões     | —    | Teto para futuros mints        |

## Contrato em Produção

| Rede    | Endereço                                     | Status         |
|---------|----------------------------------------------|----------------|
| Polygon | `0xd7e0cef1511a7eef7fc57998214fb17a270a8b57` | ✅ Em produção |

- Polygonscan: https://polygonscan.com/address/0xd7e0cef1511a7eef7fc57998214fb17a270a8b57

## Site e Whitepaper

- Site oficial: `site/index.html`
- Whitepaper PT: `site/whitepaper/whitepaper-pt.html`
- Whitepaper EN: `site/whitepaper/whitepaper-en.html`

## Requisitos de Ambiente

- Node.js **22.13.0+** (obrigatório para Hardhat 3)
- npm 10+
- Arquivos de versionamento de runtime incluídos:
   - `.nvmrc`
   - `.node-version`

Se você usa nvm:

```bash
nvm use
```

## Instalação

```bash
nvm use
npm install
```

Configure o `.env` (use `.env.example` como base):

```
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=sua_chave_privada
RECIPIENT_ADDRESS=0xSuaMetaMask
TOKEN_ADDRESS=0xEnderecoDoContrato
TOKEN_ADDRESS_POLYGON=0xEnderecoPolygon
TOKEN_ADDRESS_AMOY=0xEnderecoAmoy
ETHERSCAN_API_KEY=sua_api_key
POLYGONSCAN_API_KEY=sua_api_key_polygon
LIQUIDITY_BITI_AMOUNT=700000000
LIQUIDITY_ETH_AMOUNT=0.04
```

> Gere uma nova carteira com: `npm run wallet:new`

> Recomendado: use `TOKEN_ADDRESS_POLYGON` para operação segura em produção. O `TOKEN_ADDRESS` continua como fallback.

## Estrutura do Projeto

```
biticoin1/
├── contracts/Biticoin.sol           # Contrato ERC-20 principal
├── scripts/
│   ├── deploy/
│   │   ├── deploy-local.js              # Deploy na rede local
│   │   ├── deploy-polygon.js            # Deploy na Polygon
│   │   └── launch-mainnet.js            # Launch automático (deploy + transfer + verify) em modo Polygon-only
│   └── utils/
│       ├── generate-wallet.js           # Gerar nova carteira
│       ├── check-balance.js             # Verificar saldo da carteira por rede
│       ├── send-90-percent.js           # Enviar 90% dos tokens
│       ├── add-liquidity.js             # Adicionar liquidez no Uniswap V2
│       ├── verify.js                    # Verificar contrato no explorer
│       ├── info.js                      # Exibir informações do token
│       └── test-transfer-90.js          # Testar transferência de 90% localmente
├── site/
│   ├── index.html                       # Site oficial
│   └── whitepaper/
│       ├── whitepaper-pt.html           # Whitepaper em português
│       └── whitepaper-en.html           # Whitepaper em inglês
├── test/Biticoin.test.js            # Testes unitários (25/25, cobertura completa)
└── AUDIT_REPORT.md                      # Relatório de auditoria de segurança
```

## Comandos

### Testes
```bash
npm run test
```

> Em Hardhat 3, o comando `npm run test` executa os testes Solidity e também os testes JavaScript (Mocha) automaticamente.

### Compilar contrato
```bash
npm run compile
```

### Carteira

```bash
npm run wallet:new          # Gerar nova carteira Ethereum
npm run balance:polygon     # Verificar saldo MATIC na Polygon
```

### Launch Automático

Os scripts de launch de outras redes estão bloqueados. Use apenas Polygon:

```bash
npm run launch:polygon:auto
```

### Deploy Manual

```bash
npm run deploy:local        # Local (sem custo, para desenvolvimento)
npm run deploy:polygon      # Polygon (produção)
```

### Transferir 90% dos tokens

```bash
# Defina TOKEN_ADDRESS e RECIPIENT_ADDRESS no .env
npm run transfer:90:polygon # Polygon
```

### Adicionar liquidez no Uniswap V2

Adicione o par BITI/ETH no Uniswap V2:

```bash
# Ajuste no .env:
# LIQUIDITY_BITI_AMOUNT=700000000    (ex: 700 milhões de BITI)
# LIQUIDITY_ETH_AMOUNT=0.04          (ex: 0.04 ETH)

npm run liquidity:polygon   # Polygon
```

O script irá:
1. Aprovar o Uniswap Router para gastar seus BITI
2. Adicionar liquidez no par BITI/ETH
3. Exibir o link do par e da transação no Etherscan

> Necessário ter saldo suficiente de BITI e ETH na carteira do deployer.

### Informações do contrato

```bash
npm run info:polygon
```

### Usar MetaMask diretamente

1. Abra a MetaMask e selecione a rede (`Polygon Mainnet`)
2. Clique em **Importar token** e informe:
   - Endereço Polygon: `0xd7e0cef1511a7eef7fc57998214fb17a270a8b57`
   - Símbolo: `BITI`
   - Decimais: `18`
3. Verifique em:
   - Polygon: https://polygonscan.com

## Status

✅ Contrato criado e auditado (72/72 testes passando: 25 funcionais + 47 de vulnerabilidade)  
✅ Contrato em produção Polygon: `0xd7e0cef1511a7eef7fc57998214fb17a270a8b57`  
✅ Modo operacional Polygon-only aplicado nos scripts críticos  
✅ Auditoria de segurança concluída (`AUDIT_REPORT.md`) — 72/72 testes, 0 vulnerabilidades críticas  
✅ Migração de tooling concluída para **Hardhat 3** + plugins compatíveis  
✅ Requisito de runtime definido para **Node 22.13.0+**  
✅ Site oficial criado (`site/index.html`)  
✅ Whitepaper PT e EN criados  
✅ Tokenomics: 80% imediato + 20% vesting 180 dias  
✅ Fluxos de consulta e operação em Polygon validados  
✅ Teste de vulnerabilidades: 47/47 vetores auditados (reentrância, overflow, bypass de pause, etc.)  
✅ Ambiente focado em produção Polygon  

### Dependências (estado atual)

- `hardhat`: `^3.7.0`
- `@nomicfoundation/hardhat-ethers`: `^4.0.12`
- `@nomicfoundation/hardhat-ethers-chai-matchers`: `^3.0.9`
- `@nomicfoundation/hardhat-mocha`: `^3.0.8`
- `@nomicfoundation/hardhat-verify`: `^3.0.18`

### Segurança de dependências (npm audit)

- Estado atual: **15 vulnerabilidades** (9 low, 5 moderate, 1 high, 0 critical)
- Observação: os alertas são majoritariamente do ecossistema de ferramentas de desenvolvimento, não de lógica do contrato já implantado.

## Roteiro para Listagem (CoinGecko / CoinMarketCap / Coinbase)

1. ✅ **Contrato** — ERC-20 auditado e deployado
2. ✅ **Whitepaper** — PT e EN disponíveis em `site/whitepaper/`
3. ✅ **Site** — Disponível em `site/index.html`
4. ⏳ **Liquidez** — Reforçar par BITI/ETH na Polygon (`npm run liquidity:polygon`)
5. ⏳ **Comunidade** — Discord, Twitter/X, Telegram
6. ⏳ **Aplicação** — Submeter formulário CoinGecko/CoinMarketCap com contrato mainnet
7. ⏳ **Legal** — Consultar advogados para compliance KYC/AML

## Aviso

## Segurança e Cobertura

- Vesting corrigido: agora usa `_transfer` (não burla pause, seguro)
- Testes cobrem: vesting, controle de acesso, taxa, destinatário, allowance, edge cases
- **Auditoria de vulnerabilidades:** 47/47 vetores testados (reentrância, overflow, bypass de pause, front-running, endereço zero, invariante de supply, allowance, centralização, tokens presos)
- **Total: 72/72 testes passando — 0 vulnerabilidades críticas**
- Dependências de desenvolvimento podem ter alertas, mas **não afetam o contrato na blockchain**

Este projeto é para fins educacionais. Para uso em produção:
- Nunca armazene nem compartilhe chaves privadas em arquivos versionados ou expostos.
- Mantenha o arquivo `.env` fora do repositório e use gerenciamento seguro de segredos.
- Realize auditoria de segurança profissional antes de qualquer mudança de rede ou novo deploy.
- Faça testes completos de deploy, transferência, taxa, vesting e liquidez antes do lançamento público.
- Consulte especialistas jurídicos e financeiros antes de lançar e divulgar o token.
