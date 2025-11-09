# 🍊 Natural Fruit PWA

Sistema completo de gestão de produção, vendas e relatórios para a Natural Fruit.

![Natural Fruit](https://img.shields.io/badge/Status-Produção-success)
![Vue 3](https://img.shields.io/badge/Vue-3-green)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue)

## 📋 Funcionalidades

### ✅ Gestão de Produtos
- Cadastro completo de produtos
- Controle de preços e unidades de medida
- Ativação/desativação de produtos

### 📊 Controle de Produção Diária
- Registro de produção por produto
- Controle de perdas e trocas
- Cálculo automático de percentuais
- Relatórios diários, semanais e mensais

### 💰 Gestão de Vendas
- Registro de vendas com múltiplos métodos de pagamento
- Controle de pagamentos (Pago/Pendente)
- Filtros avançados por data, método e status
- Integração com clientes

### 👥 Gestão de Clientes
- Cadastro de PF e PJ
- Controle de emissão de nota fiscal
- Histórico de compras

### 📈 Relatórios Avançados
- Relatórios de vendas, produção e perdas
- Exportação em PDF e Excel
- Filtros por período
- Dashboards interativos

### 🔐 Controle de Acesso
- Sistema de autenticação
- Perfis de usuário (Admin e User)
- Permissões diferenciadas

## 🚀 Tecnologias

- **Frontend:** Vue 3 + Vite
- **Estilização:** Tailwind CSS
- **Banco de Dados:** Supabase (PostgreSQL)
- **PWA:** Vite PWA Plugin
- **Relatórios:** jsPDF + XLSX
- **Gerenciamento de Estado:** Pinia
- **Roteamento:** Vue Router

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/natural-fruit-pwa.git
cd natural-fruit-pwa
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e a chave anônima do projeto

#### 3.2. Execute o schema SQL
- No painel do Supabase, vá em SQL Editor
- Cole o conteúdo do arquivo `supabase-schema.sql`
- Execute o script

#### 3.3. Crie o primeiro usuário admin
No Supabase:
1. Vá em Authentication > Users
2. Clique em "Add user"
3. Crie um usuário com email e senha
4. Copie o UUID do usuário criado
5. No SQL Editor, execute:
```sql
INSERT INTO profiles (id, name, role) 
VALUES ('UUID_DO_USUARIO', 'Administrador', 'admin');
```

### 4. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:5173`

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## 📱 Instalação como PWA

Após acessar o sistema pelo navegador:
1. No Chrome/Edge: Clique no ícone de instalação na barra de endereços
2. No Safari (iOS): Clique em "Compartilhar" > "Adicionar à Tela Inicial"

## 🎨 Estrutura do Projeto

```
natural-fruit-pwa/
├── public/               # Arquivos estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   └── Layout.vue   # Layout principal com menu
│   ├── lib/             # Configurações
│   │   └── supabase.js  # Cliente Supabase
│   ├── stores/          # Gerenciamento de estado (Pinia)
│   │   ├── auth.js      # Store de autenticação
│   │   └── product.js   # Store de produtos
│   ├── views/           # Páginas da aplicação
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── Producao.vue
│   │   ├── Vendas.vue
│   │   ├── Clientes.vue
│   │   ├── Produtos.vue
│   │   ├── Relatorios.vue
│   │   └── Configuracoes.vue
│   ├── router/          # Configuração de rotas
│   ├── App.vue          # Componente raiz
│   ├── main.js          # Ponto de entrada
│   └── style.css        # Estilos globais
├── supabase-schema.sql  # Schema do banco de dados
├── vite.config.js       # Configuração do Vite
├── tailwind.config.js   # Configuração do Tailwind
└── package.json
```

## 👤 Credenciais Padrão

Após criar o usuário admin no Supabase, use as credenciais configuradas:
- **Email:** o email que você cadastrou
- **Senha:** a senha que você definiu

## 🎯 Fluxo de Uso

### 1. Dashboard
- Visualize resumo diário de produção, vendas, perdas e trocas
- Acompanhe vendas por forma de pagamento
- Veja produtos mais vendidos
- Monitore vendas pendentes

### 2. Produção
- Registre a produção diária de cada produto
- Informe perdas e trocas
- Visualize percentuais automaticamente

### 3. Vendas
- Registre cada venda
- Escolha cliente, produto e quantidade
- Defina forma de pagamento
- Marque como pago ou pendente

### 4. Clientes
- Cadastre clientes PF e PJ
- Defina se requer nota fiscal
- Mantenha histórico de contatos

### 5. Produtos (Admin)
- Cadastre novos produtos
- Defina preços e unidades
- Ative/desative produtos

### 6. Relatórios
- Gere relatórios por período
- Filtre por tipo (vendas, produção, perdas)
- Exporte em PDF ou Excel

## 🔧 Manutenção

### Backup do Banco de Dados
No Supabase, vá em Database > Backups para configurar backups automáticos.

### Atualização de Produtos
Apenas usuários com perfil Admin podem adicionar ou editar produtos.

### Gerenciamento de Usuários
Novos usuários devem ser criados no painel do Supabase > Authentication.

## 📞 Suporte

Para dúvidas ou problemas:
- Email: contato@naturalfruit.com
- WhatsApp: (75) 99999-9999

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para Natural Fruit.

---

**Desenvolvido com ❤️ para Natural Fruit** 🍊🍎🍌
