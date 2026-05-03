# Biti Token (BITI)

Uma criptomoeda ERC-20 baseada em conceitos do Bitcoin, com auditoria de segurança, vesting do fundador e liquidez no Uniswap V2.

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

## Contratos Deployados

| Rede    | Endereço                                     | Status     |
|---------|----------------------------------------------|------------|
| Sepolia | `0x54B9b4db91eC0dE6D3e381D73F6634771a04cF7D` | ✅ Verificado |
| Mainnet | —                                            | ⏳ Pendente  |

- Deployer: `0x842c3D5cC3D31395d323e51795c82F50287fDa2E`
- MetaMask recipient: `0x10F35ede5941cE7f11A866A239C0bBea4FCf0a5b`
- Etherscan Sepolia: https://sepolia.etherscan.io/address/0x54B9b4db91eC0dE6D3e381D73F6634771a04cF7D

## Site e Whitepaper

- Site oficial: `site/index.html`
- Whitepaper PT: `site/whitepaper/whitepaper-pt.html`
- Whitepaper EN: `site/whitepaper/whitepaper-en.html`

## Instalação

```bash
npm install
```

Configure o `.env` (use `.env.example` como base):

```
SEPOLIA_RPC_URL=https://sepolia.drpc.org
MAINNET_RPC_URL=https://ethereum-rpc.publicnode.com
PRIVATE_KEY=sua_chave_privada
RECIPIENT_ADDRESS=0xSuaMetaMask
TOKEN_ADDRESS=0xEnderecoDoContrato
ETHERSCAN_API_KEY=sua_api_key
LIQUIDITY_BITI_AMOUNT=700000000
LIQUIDITY_ETH_AMOUNT=0.04
```

> Gere uma nova carteira com: `npm run wallet:new`

## Estrutura do Projeto

```
Biti1/
├── contracts/Biti.sol               # Contrato ERC-20 principal
├── scripts/
│   ├── deploy/
│   │   ├── deploy-local.js              # Deploy na rede local
│   │   ├── deploy-sepolia.js            # Deploy na Sepolia testnet
│   │   ├── deploy-mainnet.js            # Deploy na Mainnet
│   │   ├── launch-sepolia.js            # Launch automático (deploy + transfer + verify) Sepolia
│   │   └── launch-mainnet.js            # Launch automático (deploy + transfer + verify) Mainnet
│   └── utils/
│       ├── generate-wallet.js           # Gerar nova carteira
│       ├── check-balance.js             # Verificar saldo ETH
│       ├── send-90-percent.js           # Enviar 90% dos tokens
│       ├── add-liquidity.js             # Adicionar liquidez no Uniswap V2
│       ├── verify.js                    # Verificar contrato no Etherscan
│       ├── info.js                      # Exibir informações do token
│       └── test-transfer-90.js          # Testar transferência de 90% localmente
├── site/
│   ├── index.html                       # Site oficial
│   └── whitepaper/
│       ├── whitepaper-pt.html           # Whitepaper em português
│       └── whitepaper-en.html           # Whitepaper em inglês
├── test/Biti.test.js                # Testes unitários (25/25, cobertura completa)
└── AUDIT_REPORT.md                      # Relatório de auditoria de segurança
```

## Comandos

### Testes
```bash
npm run test
```

### Compilar contrato
```bash
npm run compile
```

### Carteira

```bash
npm run wallet:new          # Gerar nova carteira Ethereum
npm run balance:sepolia     # Verificar saldo ETH na Sepolia
npm run balance:mainnet     # Verificar saldo ETH na Mainnet
```

### Launch Automático (recomendado)

Faz deploy + transferência 90% para MetaMask + verificação Etherscan em um único comando:

```bash
# Sepolia testnet
npm run launch:sepolia:auto

# Mainnet Ethereum
npm run launch:mainnet:auto
```

### Deploy Manual

```bash
npm run deploy:local        # Local (sem custo, para desenvolvimento)
npm run deploy:sepolia      # Sepolia testnet
npm run deploy:mainnet      # Mainnet Ethereum
```

### Transferir 90% dos tokens

```bash
# Defina TOKEN_ADDRESS e RECIPIENT_ADDRESS no .env
npm run transfer:90         # Sepolia
npm run transfer:90:main    # Mainnet
```

### Adicionar liquidez no Uniswap V2

Adicione o par BITI/ETH no Uniswap V2:

```bash
# Ajuste no .env:
# LIQUIDITY_BITI_AMOUNT=700000000    (ex: 700 milhões de BITI)
# LIQUIDITY_ETH_AMOUNT=0.04          (ex: 0.04 ETH)

npm run liquidity:sepolia   # Sepolia testnet
npm run liquidity:mainnet   # Mainnet
```

O script irá:
1. Aprovar o Uniswap Router para gastar seus BITI
2. Adicionar liquidez no par BITI/ETH
3. Exibir o link do par e da transação no Etherscan

> Necessário ter saldo suficiente de BITI e ETH na carteira do deployer.

### Informações do contrato

```bash
npm run info:sepolia
npm run info:mainnet
```

### Usar MetaMask diretamente

1. Abra a MetaMask e selecione a rede (`Sepolia` ou `Ethereum Mainnet`)
2. Clique em **Importar token** e informe:
   - Endereço Sepolia: `0x54B9b4db91eC0dE6D3e381D73F6634771a04cF7D`
   - Símbolo: `BITI`
   - Decimais: `18`
3. Verifique em:
   - Sepolia: https://sepolia.etherscan.io
   - Mainnet: https://etherscan.io

## Status

✅ Contrato criado e auditado (72/72 testes passando: 25 funcionais + 47 de vulnerabilidade)  
✅ Deploy Sepolia: `0x54B9b4db91eC0dE6D3e381D73F6634771a04cF7D`  
✅ 71,28 bilhões BITI transferidos para MetaMask  
✅ Contrato verificado no Etherscan Sepolia  
✅ Auditoria de segurança concluída (`AUDIT_REPORT.md`) — 72/72 testes, 0 vulnerabilidades críticas  
✅ Site oficial criado (`site/index.html`)  
✅ Whitepaper PT e EN criados  
✅ Tokenomics: 80% imediato + 20% vesting 180 dias  
✅ Liquidez no Uniswap Sepolia concluída (`npm run liquidity:sepolia`)  
✅ Teste de vulnerabilidades: 47/47 vetores auditados (reentrância, overflow, bypass de pause, etc.)  
⏳ Deploy Mainnet (aguardando ETH na carteira deployer)  

## Roteiro para Listagem (CoinGecko / CoinMarketCap / Coinbase)

1. ✅ **Contrato** — ERC-20 auditado e deployado
2. ✅ **Whitepaper** — PT e EN disponíveis em `site/whitepaper/`
3. ✅ **Site** — Disponível em `site/index.html`
4. ⏳ **Liquidez** — Adicionar par BITI/ETH no Uniswap (`npm run liquidity:mainnet`)
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
- Realize auditoria de segurança profissional antes do deploy em mainnet.
- Faça testes completos de deploy, transferência, taxa, vesting e liquidez antes do lançamento público.
- Consulte especialistas jurídicos e financeiros antes de lançar e divulgar o token.
