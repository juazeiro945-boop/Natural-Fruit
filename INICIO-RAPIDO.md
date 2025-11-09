# ⚡ INÍCIO RÁPIDO - Natural Fruit PWA

## 🚀 Em 5 Minutos

### 1. Instale as dependências
```bash
cd natural-fruit-pwa
npm install
```

### 2. Configure o Supabase
1. Acesse https://supabase.com e crie um projeto
2. Copie a URL e a chave anônima
3. Crie o arquivo `.env`:
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Execute o schema SQL
- No Supabase: SQL Editor
- Cole o conteúdo de `supabase-schema.sql`
- Execute

### 4. Crie o usuário admin
1. Supabase > Authentication > Users > Add user
2. Anote o UUID do usuário
3. No SQL Editor:
```sql
INSERT INTO profiles (id, name, role) 
VALUES ('UUID_AQUI', 'Admin', 'admin');
```

### 5. Rode o projeto
```bash
npm run dev
```

Acesse: http://localhost:5173

## 🎯 Próximos Passos

1. Faça login com as credenciais criadas
2. Cadastre produtos em Produtos (menu lateral)
3. Cadastre clientes em Clientes
4. Registre produção diária em Produção
5. Registre vendas em Vendas
6. Visualize relatórios em Relatórios

## 📦 Build para Produção

```bash
npm run build
```

Arquivos prontos em `dist/`

## 🔗 Links Úteis

- [README Completo](./README.md)
- [Guia de Deploy](./DEPLOY.md)
- [Schema SQL](./supabase-schema.sql)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vue 3](https://vuejs.org/)

## ❓ Problemas Comuns

### Erro ao conectar com Supabase
✅ Verifique se copiou corretamente URL e chave no `.env`

### Não consigo fazer login
✅ Confirme que criou o perfil na tabela `profiles`

### Página em branco
✅ Abra o console do navegador (F12) e veja os erros

### PWA não instala
✅ Use HTTPS em produção (Vercel/Netlify fazem isso automaticamente)

## 📞 Suporte

Problemas? Entre em contato:
- Email: contato@naturalfruit.com
- WhatsApp: (75) 99999-9999

---

**Desenvolvido para Natural Fruit** 🍊
