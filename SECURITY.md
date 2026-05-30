# SECURITY.md

## Política de Segurança – Biticoin

### Status Atual
- O projeto Biticoin utiliza dependências amplamente adotadas no ecossistema Ethereum (Hardhat, Ethers, OpenZeppelin, Chai, Mocha).
- Auditorias automáticas (`npm audit`) são realizadas periodicamente.
- No momento, não há vulnerabilidades críticas conhecidas que afetem o core do contrato ou a lógica de negócio.

### Vulnerabilidades Herdadas
- Algumas vulnerabilidades de nível baixo a alto permanecem devido a dependências upstream (ex: `elliptic`, `ws`, `mocha`, `serialize-javascript`).
- Essas vulnerabilidades não possuem correção disponível ou exigem atualização de pacotes principais que podem impactar a compatibilidade do projeto.
- Todas as dependências são mantidas sob monitoramento e serão atualizadas assim que versões seguras e compatíveis estiverem disponíveis.

### Boas Práticas Adotadas
- **Nunca** expor ou commitar segredos de `.env`.
- Scripts de deploy/transferência para mainnet exigem validação em testnet e confirmação explícita.
- Testes de vulnerabilidade são executados periodicamente (`test/VulnerabilityAudit.test.js`).
- O projeto segue padrões de segurança OpenZeppelin e recomendações da comunidade.

### Como reportar vulnerabilidades
Se você identificar uma vulnerabilidade que afete o core do contrato ou scripts sensíveis, por favor abra uma issue marcada como `security` ou envie um e-mail para o mantenedor do projeto.

---

**Última revisão:** 30/05/2026
