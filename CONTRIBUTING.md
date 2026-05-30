# Guia de Contribuição Biticoin

Obrigado por contribuir com o projeto Biticoin!

## Como contribuir

1. **Fork o repositório** e crie sua branch a partir da `main`.
2. **Nomeie a branch** de forma descritiva, exemplo: `feature/nome-da-feature`, `fix/bug-descricao`, `chore/ajuste-rotina`.
3. **Faça commits pequenos e claros**. Use mensagens no padrão:
   - `feat: ...` para novas funcionalidades
   - `fix: ...` para correções
   - `chore: ...` para tarefas de manutenção
   - `docs: ...` para documentação
4. **Rode os testes localmente** antes de abrir um PR:
   ```sh
   npm install
   npm run compile
   npm run test
   ```
5. **Abra um Pull Request** para a branch `main`.
   - Descreva claramente o que foi feito e o motivo.
   - Relacione issues se aplicável.
6. **Aguarde revisão**. Responda comentários e faça ajustes se necessário.

## Padrões de Código
- Use sempre Node.js 22.13.0+ (nvm recomendado)
- Siga o padrão ESM (import/export)
- Não altere constantes de tokenomics sem aprovação
- Não exponha segredos ou chaves em código ou logs

## Segurança
- Nunca faça deploy direto em mainnet sem validação em testnet
- Scripts críticos exigem confirmação manual
- Variáveis sensíveis devem estar apenas em `.env` (não commitado)

## Dúvidas?
Abra uma issue ou discuta no PR!
