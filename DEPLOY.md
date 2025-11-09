# 🚀 Guia de Deploy - Natural Fruit PWA

## Opções de Deploy

### 1. Vercel (Recomendado)

#### Instalação
```bash
npm install -g vercel
```

#### Deploy
```bash
npm run build
vercel --prod
```

#### Configuração de Variáveis de Ambiente
No painel da Vercel:
1. Acesse seu projeto
2. Vá em Settings > Environment Variables
3. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 2. Netlify

#### Deploy via CLI
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

#### Arquivo netlify.toml
Crie na raiz do projeto:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Hospedagem Própria

#### Requisitos
- Servidor web (Apache/Nginx)
- Node.js 18+ para build
- HTTPS (necessário para PWA)

#### Passos
```bash
# 1. Build da aplicação
npm run build

# 2. Copie o conteúdo de dist/ para seu servidor
scp -r dist/* usuario@servidor:/caminho/do/site

# 3. Configure o servidor web
```

#### Exemplo Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name naturalfruit.com.br;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/natural-fruit;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

## 📱 Configuração PWA

### Ícones
Os ícones do PWA devem estar em `/public`:
- `logo-192.png` (192x192px)
- `logo-512.png` (512x512px)
- `favicon.ico`

### Criar Ícones
Você pode usar ferramentas online como:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

Ou usar a logo fornecida e gerar os tamanhos necessários.

## 🔒 Configurações de Segurança do Supabase

### 1. Row Level Security (RLS)
O schema já inclui políticas de segurança. Verifique se RLS está habilitado:
```sql
-- No SQL Editor do Supabase
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 2. URLs Permitidas
No painel do Supabase:
1. Vá em Authentication > URL Configuration
2. Em Site URL, adicione: `https://seu-dominio.com`
3. Em Redirect URLs, adicione: `https://seu-dominio.com/**`

### 3. Políticas de Senha
Em Authentication > Policies, configure:
- Mínimo de 8 caracteres
- Requer letra maiúscula e minúscula
- Requer número

## 📊 Monitoramento

### Supabase Dashboard
Monitore:
- Uso de banco de dados
- Requisições da API
- Usuários ativos
- Logs de erro

### Análise de Uso
Integre Google Analytics:
```html
<!-- Adicione no index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 Atualizações

### Atualização do Sistema
```bash
# 1. Faça pull das mudanças
git pull origin main

# 2. Instale novas dependências
npm install

# 3. Build
npm run build

# 4. Deploy
vercel --prod  # ou netlify deploy --prod
```

### Migrações do Banco
Para alterações no schema:
1. Crie um novo arquivo SQL
2. Execute no SQL Editor do Supabase
3. Teste em ambiente de desenvolvimento primeiro

## 🎯 Checklist de Produção

- [ ] Configurar variáveis de ambiente
- [ ] Criar usuário admin no Supabase
- [ ] Executar schema SQL
- [ ] Habilitar RLS em todas as tabelas
- [ ] Configurar URLs permitidas
- [ ] Gerar ícones PWA
- [ ] Testar instalação como app
- [ ] Configurar HTTPS
- [ ] Testar backup do Supabase
- [ ] Configurar monitoramento
- [ ] Documentar credenciais

## 📞 Troubleshooting

### PWA não instala
- Verifique se está usando HTTPS
- Confirme que manifest.json está sendo gerado
- Teste no Chrome DevTools > Application > Manifest

### Erro de conexão com Supabase
- Verifique variáveis de ambiente
- Confirme URL e chave anônima
- Teste conexão no navegador: `https://seu-projeto.supabase.co/rest/v1/`

### Problemas de autenticação
- Verifique RLS nas tabelas
- Confirme políticas de segurança
- Teste com diferentes usuários

### Erro ao gerar relatórios
- Verifique permissões do usuário
- Confirme dados no banco
- Teste queries diretamente no Supabase

## 🔐 Backup

### Backup Manual
```bash
# No servidor Supabase, use pg_dump
pg_dump -h db.seu-projeto.supabase.co -U postgres -d postgres > backup.sql
```

### Backup Automático
Configure no painel do Supabase:
- Database > Backups
- Ative backups automáticos diários
- Configure retenção de 7-30 dias

## 📈 Performance

### Otimizações
- [ ] Minificação automática (já incluída no Vite)
- [ ] Compressão Gzip no servidor
- [ ] Cache de assets estáticos
- [ ] Lazy loading de rotas (já implementado)
- [ ] Service Worker para cache offline

### Monitoramento de Performance
Use Lighthouse:
```bash
npm install -g lighthouse
lighthouse https://seu-dominio.com --view
```

---

**Boa sorte com o deploy! 🚀**
