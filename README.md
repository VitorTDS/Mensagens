# Nosso cantinho

Nosso cantinho e um aplicativo privado de mensagens para casal, construido com React, Vite, TailwindCSS e Supabase. O projeto ja vem com modo mock para desenvolvimento imediato e com estrutura pronta para deploy.

## Stack

- React 19 + Vite + TypeScript
- TailwindCSS
- Supabase Auth, Database, Storage e Realtime
- PostgreSQL no Supabase
- Framer Motion
- Lucide Icons
- PWA instalavel

## Estrutura

```text
src/
  components/
  contexts/
  hooks/
  layouts/
  lib/
  pages/
  services/
  styles/
  types/
supabase/
  schema.sql
```

## Funcionalidades entregues

- Entrada por codigo numerico
- Persistencia de sessao
- Rotas protegidas
- Chat em tempo real com fallback mock
- Indicador digitando
- Status online/offline
- Upload de imagens
- Bucket privado com URLs assinadas
- Favoritos
- Botao saudade
- Coracao animado
- Contador de dias juntos
- Tela de lembrancas
- Tema claro/escuro
- Sons de mensagem
- Notificacoes do navegador
- Criptografia basica de mensagens com Web Crypto
- PWA instalavel

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir de `.env.example`.

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. Gere build de producao:

```bash
npm run build
```

## Configuracao do Supabase

1. Crie um projeto no Supabase.
2. Em `SQL Editor`, execute o arquivo [schema.sql](./supabase/schema.sql).
3. Ative `Email` em `Authentication > Providers`.
4. Crie os dois usuarios autorizados em `Authentication > Users`. A senha de cada um e o codigo numerico usado na tela de entrada: precisa ter so numeros, pelo menos 6 digitos e ser diferente entre os dois.
5. Copie `Project URL` e `anon public key` para o `.env`.
6. Defina `VITE_MOONCHAT_ALLOWED_EMAILS` com os dois emails. O codigo e testado neles para identificar quem entrou.
7. Crie o bucket `moonchat-media` caso prefira manualmente.
8. Defina `VITE_MESSAGE_SECRET` com um valor proprio em producao.

## Modo mock

Se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nao forem definidos, o app roda em modo mock com dados locais.

Em desenvolvimento, qualquer codigo com pelo menos 4 numeros entra. Codigos diferentes viram pessoas diferentes.

## Deploy

### GitHub Pages

1. O projeto usa `HashRouter` e `base: './'` para funcionar no GitHub Pages.
2. Gere o build com `npm run build`.
3. Publique o conteudo de `dist` na branch `gh-pages`.
4. Ative o GitHub Pages no repositorio apontando para a branch `gh-pages`.

### Vercel

1. Suba o projeto para GitHub.
2. Importe na Vercel.
3. Configure as variaveis de ambiente do `.env.example`.
4. Build command: `npm run build`
5. Output directory: `dist`

### Netlify

1. Conecte o repositorio.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Adicione as mesmas variaveis de ambiente.

## Observacoes de seguranca

- O projeto usa criptografia basica no cliente para preparar a evolucao para ponta a ponta.
- Para E2EE real, adicione troca de chaves por usuario e gerenciamento seguro de dispositivos.
- O acesso fica restrito aos emails definidos em `VITE_MOONCHAT_ALLOWED_EMAILS` / `NEXT_PUBLIC_MOONCHAT_ALLOWED_EMAILS`.
- As imagens ficam em bucket privado e sao resolvidas por URL assinada no cliente autenticado.
- `VITE_MESSAGE_SECRET` precisa existir em producao para evitar uso de chave previsivel.

## Proximos passos recomendados

- Vincular um room_id explicito para futuras expansoes
- Adicionar notificacoes push via Supabase Edge Functions
- Implementar E2EE completa com libsodium
- Adicionar mensagens de voz
