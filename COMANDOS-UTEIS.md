# ⚡ COMANDOS ÚTEIS - Natural Fruit PWA

## 🚀 Desenvolvimento

### Instalar dependências
```bash
npm install
```

### Rodar em modo de desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:5173

### Build para produção
```bash
npm run build
```
Arquivos gerados em: `dist/`

### Preview da build de produção
```bash
npm run preview
```

---

## 🗄️ Supabase

### Executar schema SQL
1. Abra o Supabase
2. Vá em SQL Editor
3. Cole o conteúdo de `supabase-schema.sql`
4. Clique em "Run"

### Criar usuário admin via SQL
```sql
-- 1. Primeiro crie o usuário em Authentication > Users
-- 2. Depois execute:
INSERT INTO profiles (id, name, role) 
VALUES ('UUID_DO_USUARIO', 'Administrador', 'admin');
```

### Ver todas as tabelas
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Resetar dados (CUIDADO!)
```sql
-- Limpar todas as vendas
DELETE FROM sales;

-- Limpar toda a produção
DELETE FROM production;

-- Limpar clientes (exceto os de exemplo)
DELETE FROM clients WHERE id NOT IN (
  SELECT id FROM clients LIMIT 3
);
```

---

## 🚢 Deploy

### Vercel
```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy
npm run build
vercel --prod
```

### Netlify
```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run build
netlify deploy --prod
```

### Build local e testar
```bash
# Build
npm run build

# Servir localmente
npx serve dist
```

---

## 🔧 Manutenção

### Atualizar dependências
```bash
# Ver dependências desatualizadas
npm outdated

# Atualizar todas (com cuidado)
npm update

# Atualizar dependência específica
npm install vue@latest
```

### Limpar cache
```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpar cache do Vite
rm -rf node_modules/.vite
npm run dev
```

---

## 🐛 Debug

### Ver logs do navegador
```
F12 > Console
```

### Inspecionar PWA
```
F12 > Application > Manifest
F12 > Application > Service Workers
```

### Ver erros do Supabase
```javascript
// Adicione em supabase.js temporariamente
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session)
})
```

---

## 📊 Relatórios e Testes

### Testar performance (Lighthouse)
```bash
npm install -g lighthouse
npm run build
npx serve dist

# Em outra aba
lighthouse http://localhost:3000 --view
```

### Analisar bundle
```bash
npm install -g vite-bundle-visualizer
npm run build
npx vite-bundle-visualizer
```

---

## 🎨 Customização

### Trocar cores principais
Edite `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#FF8C00', // Sua cor laranja
  },
  secondary: {
    500: '#228B22', // Sua cor verde
  }
}
```

### Trocar logo
Substitua os arquivos em `/public`:
- `logo-192.png` (192x192px)
- `logo-512.png` (512x512px)
- `favicon.ico`

### Trocar nome do app
Edite `vite.config.js`:
```javascript
manifest: {
  name: 'Seu Nome Aqui',
  short_name: 'Nome Curto',
}
```

---

## 🔐 Segurança

### Criar .env local
```bash
cp .env.example .env
# Edite com suas credenciais
```

### Nunca commitar .env
Está em `.gitignore`, mas verifique:
```bash
cat .gitignore | grep .env
```

### Gerar senha segura para admin
```bash
openssl rand -base64 12
```

---

## 📝 Backup

### Backup do código
```bash
# Git
git add .
git commit -m "Backup do código"
git push

# Ou ZIP
cd ..
zip -r natural-fruit-backup.zip natural-fruit-pwa
```

### Backup do banco (Supabase)
```bash
# Via interface: Database > Backups
# Ou via pg_dump (requer acesso direto)
```

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 5173 already in use"
```bash
# Mate o processo
lsof -ti:5173 | xargs kill -9
# Ou use outra porta
npm run dev -- --port 3000
```

### Erro de conexão com Supabase
```bash
# Verifique .env
cat .env

# Teste a URL
curl https://seu-projeto.supabase.co/rest/v1/
```

### PWA não atualiza
```bash
# Limpe cache do service worker
# No navegador: F12 > Application > Service Workers > Unregister
# Depois: Shift + F5
```

---

## 📦 Scripts Personalizados

Adicione em `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy:vercel": "npm run build && vercel --prod",
  "deploy:netlify": "npm run build && netlify deploy --prod",
  "clean": "rm -rf node_modules dist .vite",
  "reset": "npm run clean && npm install"
}
```

Uso:
```bash
npm run deploy:vercel
npm run clean
npm run reset
```

---

## 🎯 Checklist Antes de Deploy

```bash
# 1. Testar localmente
npm run dev

# 2. Build sem erros
npm run build

# 3. Preview da build
npm run preview

# 4. Variáveis de ambiente configuradas
cat .env

# 5. Schema SQL executado no Supabase
# Verificar em: Supabase > Database > Tables

# 6. Admin criado
# Verificar em: Supabase > Authentication > Users

# 7. Deploy!
npm run deploy:vercel
```

---

## 💡 Dicas

### Desenvolvimento mais rápido
- Use HMR (Hot Module Replacement) do Vite
- Mantenha console aberto (F12)
- Use extensões do Vue DevTools

### Performance
- Lazy load de rotas (já implementado)
- Optimize imagens
- Use cache do service worker

### Manutenção
- Commit frequente
- Documente mudanças
- Teste antes de deploy

---

**Happy coding! 🚀**
