# 📖 Manual do Usuário - Natural Fruit PWA

## 👋 Bem-vindo ao Sistema Natural Fruit!

Este manual vai te guiar por todas as funcionalidades do sistema.

---

## 🔐 1. LOGIN

### Primeiro Acesso
1. Abra o sistema no navegador
2. Entre com email e senha fornecidos pelo administrador
3. Você será direcionado ao Dashboard

### Tipos de Usuário
- **Admin**: Acesso total, pode gerenciar produtos e usuários
- **Usuário**: Pode registrar produção e vendas, ver relatórios

---

## 📊 2. DASHBOARD

O Dashboard mostra um resumo completo do dia:

### Estatísticas Principais
- **Total Produzido**: Quantidade de produtos fabricados hoje
- **Total Vendido**: Valor total de vendas do dia
- **Perdas**: Quantidade de produtos perdidos
- **Trocas**: Quantidade de produtos trocados

### Vendas por Pagamento
Veja quanto foi recebido em:
- 💵 Dinheiro
- 📱 PIX
- 🧾 Boleto

### Produtos Mais Vendidos
Lista dos 5 produtos mais vendidos do dia

### Vendas Pendentes
Alerta de vendas que ainda não foram pagas

---

## 🏭 3. PRODUÇÃO DIÁRIA

### Registrar Produção
1. Clique em "+ Registrar Produção"
2. Selecione a data
3. Escolha o produto
4. Informe:
   - Quantidade produzida
   - Perdas (se houver)
   - Trocas (se houver)
   - Observações (opcional)
5. Clique em "Salvar"

### Visualizar Produção
- Cards coloridos mostram cada produto
- Verde: Quantidade produzida
- Vermelho: Perdas
- Amarelo: Trocas
- Percentual de perda é calculado automaticamente

### Editar Registro
- Clique no ícone de lápis (✏️) no card
- Altere as informações
- Salve

---

## 💰 4. VENDAS

### Registrar Nova Venda
1. Clique em "+ Nova Venda"
2. Preencha:
   - Data da venda
   - Cliente (selecione da lista)
   - Produto (selecione da lista)
   - Quantidade
   - Preço é preenchido automaticamente
   - Forma de pagamento (Dinheiro/PIX/Boleto)
   - Marque se já foi pago
   - Observações (opcional)
3. Clique em "Salvar"

### Filtrar Vendas
Use os filtros para ver:
- Vendas de uma data específica
- Por forma de pagamento
- Por status (Pago/Pendente)

### Marcar como Pago
- Clique no ícone ✅ ao lado da venda
- O status mudará de Pendente para Pago

---

## 👥 5. CLIENTES

### Cadastrar Cliente
1. Clique em "+ Novo Cliente"
2. Escolha o tipo:
   - **PF** (Pessoa Física): CPF
   - **PJ** (Pessoa Jurídica): CNPJ
3. Preencha:
   - Nome ou Razão Social
   - Documento (CPF/CNPJ)
   - Telefone
   - E-mail
   - Endereço
4. Marque se requer nota fiscal
5. Clique em "Salvar"

### Visualizar Clientes
- Cards organizados mostram todos os clientes
- Ícone ✓ indica que emite nota fiscal

### Editar Cliente
- Clique no ícone ✏️ no card
- Altere as informações
- Salve

---

## 🍎 6. PRODUTOS (Apenas Admin)

### Cadastrar Produto
1. Clique em "+ Novo Produto"
2. Preencha:
   - Nome do produto
   - Descrição
   - Unidade de medida (kg, und, caixa, etc.)
   - Preço unitário
3. Clique em "Salvar"

### Editar Produto
- Clique no ícone ✏️ no card do produto
- Altere as informações
- Salve

---

## 📈 7. RELATÓRIOS

### Gerar Relatório
1. Escolha os filtros:
   - **Data Inicial**
   - **Data Final**
   - **Tipo de Relatório**:
     - Vendas
     - Produção
     - Perdas e Trocas
2. Clique em "Gerar Relatório"

### Tipos de Relatório

#### Relatório de Vendas
Mostra:
- Data, Cliente, Produto
- Quantidade, Valor Total
- Forma de Pagamento
- Status do Pagamento

#### Relatório de Produção
Mostra:
- Data, Produto
- Quantidade Produzida
- Perdas e Trocas

#### Relatório de Perdas
Mostra:
- Produtos com maior índice de perda
- Percentuais de perda e troca

### Exportar Relatório
- **📄 PDF**: Documento pronto para impressão
- **📊 Excel**: Planilha para análise

---

## ⚙️ 8. CONFIGURAÇÕES

### Atualizar Perfil
1. Altere seu nome
2. Clique em "Atualizar Perfil"

### Alterar Senha
1. Digite a nova senha
2. Confirme a nova senha
3. Clique em "Alterar Senha"

---

## 📱 9. INSTALAÇÃO COMO APP

### No Celular (Android/iOS)
1. Abra o sistema no navegador
2. Toque no menu do navegador
3. Selecione "Adicionar à Tela Inicial"
4. O app aparecerá como um ícone

### No Computador
1. Abra o sistema no Chrome/Edge
2. Clique no ícone de instalação na barra de endereços
3. Clique em "Instalar"

---

## 💡 DICAS E BOAS PRÁTICAS

### Registro Diário
✅ Registre a produção no final do dia
✅ Lance as vendas assim que acontecerem
✅ Marque pagamentos recebidos imediatamente

### Organização
✅ Cadastre clientes antes de fazer vendas
✅ Mantenha produtos atualizados
✅ Use o campo de observações quando necessário

### Relatórios
✅ Gere relatórios semanais para acompanhamento
✅ Analise percentuais de perda para melhorar processos
✅ Monitore vendas pendentes regularmente

### Segurança
✅ Não compartilhe sua senha
✅ Faça logout ao sair
✅ Use senhas fortes

---

## ❓ PERGUNTAS FREQUENTES

**P: Posso usar offline?**
R: Sim! O PWA funciona offline após a primeira carga. Os dados serão sincronizados quando voltar online.

**P: Como emito nota fiscal?**
R: Marque o cliente como "Requer nota fiscal" no cadastro. Em breve teremos integração automática.

**P: Posso deletar vendas/produção?**
R: Não. Para manter histórico, não é possível deletar. Se houver erro, entre em contato com o administrador.

**P: Quem pode ver meus dados?**
R: Apenas usuários autenticados do seu sistema. Cada empresa tem seus próprios dados isolados.

**P: Como adiciono novos usuários?**
R: Apenas o administrador pode criar usuários. Entre em contato com o admin.

---

## 🆘 SUPORTE

### Problemas Técnicos
1. Tente atualizar a página (F5)
2. Limpe o cache do navegador
3. Faça logout e login novamente
4. Entre em contato com suporte

### Contato
📧 Email: contato@naturalfruit.com
📱 WhatsApp: (75) 99999-9999
🕐 Horário: Segunda a Sexta, 8h às 18h

---

## 🎯 ATALHOS ÚTEIS

- **Dashboard**: Página inicial com resumo do dia
- **Produção**: Registro rápido da produção
- **Vendas**: Lançamento de vendas
- **Relatórios**: Análises e exportações

---

**Natural Fruit PWA v1.0** 🍊

Sistema desenvolvido para otimizar a gestão da sua produção!
