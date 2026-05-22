# UniNest

Marketplace dedicado a alojamento estudantil. Estudantes pesquisam quartos, studios, apartamentos e casas partilhadas perto das suas universidades; senhorios publicam anúncios que passam por moderação humana antes de ficarem visíveis. A comunicação entre os dois lados acontece no sistema de mensagens interno (com WebSocket + fallback de polling).

## Funcionalidades

- **3 papéis**: estudante, senhorio, admin
- **Anúncios** com fluxo completo de aprovação (`pending → approved/rejected → suspended`)
- **Pesquisa** com filtros: cidade, universidade, preço, distância, quartos, despesas incluídas, contrato, mobília, internet, multi-select de tipo de imóvel
- **Galeria de imagens** com lightbox e navegação por setas
- **Favoritos** para estudantes
- **Mensagens internas** em tempo real (WebSocket) com fallback polling automático e badge de não-lidas
- **Denúncias** de anúncios e utilizadores; admin pode descartar, marcar revista, suspender anúncio ou bloquear utilizador
- **Painel de admin** para moderação de anúncios, gestão de utilizadores e denúncias
- **Upload de imagens** com Azure Blob (com mock local para dev)
- **Rate limiting** em auth, denúncias e mensagens

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind + shadcn/ui + React Router + React Query
- **Backend**: Fastify + TypeScript + JWT + Zod
- **Persistência**: Azure Cosmos DB (com modo in-memory para dev/demo)
- **Storage**: Azure Blob Storage (com modo mock para dev)
- **Mensagens em tempo real**: `@fastify/websocket`

## Arranque rápido (modo in-memory, sem dependências cloud)

Este é o modo mais simples para um reviewer/professor experimentar o MVP sem precisar de Azure. Tudo corre em memória — os dados desaparecem a cada reinício, mas o seed cria contas demo e 10 anúncios em vários estados.

### Pré-requisitos
- Node.js 20+
- Docker (para o caminho recomendado)

### Com Docker (recomendado)

```bash
# 1) ambientes
cp .env.example .env
cp backend/.env.example backend/.env

# 2) garantir modo in-memory no backend/.env:
#    USE_IN_MEMORY_DB=true
#    BLOB_USE_MOCK=true

# 3) arrancar
npm run docker:up

# 4) abrir http://localhost:5173
```

Se já tinhas o stack a correr antes e mudaste dependências (ex: instalei novos pacotes no backend), força a recriação do volume anónimo de `node_modules`:

```bash
docker compose down && docker compose up -d --build --renew-anon-volumes backend
```

### Sem Docker

```bash
# Backend
npm --prefix backend install
USE_IN_MEMORY_DB=true BLOB_USE_MOCK=true npm --prefix backend run dev
# → http://localhost:4000

# Frontend (noutro terminal)
npm install
npm run dev
# → http://localhost:5173
```

## Contas demo (seed automático)

Password comum: `ChangeMe123!`

| Email                     | Role     |
|---------------------------|----------|
| `admin@uninest.local`     | admin    |
| `landlord@uninest.local`  | landlord |
| `student@uninest.local`   | student  |

Login → redireciona automaticamente para o painel adequado. Há também botões "Preencher" na página de login.

## Estados dos anúncios no seed

- 6 anúncios **approved** (visíveis na pesquisa)
- 2 anúncios **pending** (visíveis no painel admin → "Pendentes")
- 1 anúncio **rejected** com motivo
- 1 anúncio **suspended**

Todos pertencem ao `landlord@uninest.local`, têm 3 fotos cada e cobrem várias cidades portuguesas (Coimbra, Porto, Lisboa, Castelo Branco, Braga, Aveiro, Covilhã).

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `NODE_ENV` | `development` | |
| `PORT` | `4000` | Porta HTTP/WS |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origem permitida no CORS |
| `JWT_SECRET` | `change-me-in-production` | **MUDAR em produção** |
| `JWT_EXPIRES_IN` | `7d` | Validade dos tokens |
| `USE_IN_MEMORY_DB` | `true` | Quando `false` usa Cosmos |
| `COSMOS_ENDPOINT` | — | Necessário se `USE_IN_MEMORY_DB=false` |
| `COSMOS_KEY` | — | idem |
| `COSMOS_DATABASE_ID` | `uninest` | |
| `COSMOS_USERS_CONTAINER` | `users` | |
| `COSMOS_LISTINGS_CONTAINER` | `listings` | |
| `COSMOS_FAVOURITES_CONTAINER` | `favourites` | |
| `COSMOS_CONVERSATIONS_CONTAINER` | `conversations` | |
| `COSMOS_MESSAGES_CONTAINER` | `messages` | |
| `COSMOS_REPORTS_CONTAINER` | `reports` | |
| `BLOB_USE_MOCK` | `true` | Quando `false` usa Azure Blob |
| `BLOB_CONNECTION_STRING` | — | Necessário se `BLOB_USE_MOCK=false` |
| `BLOB_AVATARS_CONTAINER` | `avatars` | |
| `BLOB_PROPERTY_IMAGES_CONTAINER` | `property-images` | |
| `MAX_UPLOAD_SIZE_MB` | `5` | Limite por imagem |

### Frontend (`.env`)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `VITE_API_URL` | `http://localhost:4000` | URL do backend |

## Arquitetura

```
backend/src/
  config/        # env, cosmos, blob
  routes/        # registo de endpoints, hooks de auth/role
  controllers/   # handlers Fastify (thin)
  services/      # business logic
  repositories/  # acesso a dados (InMemory* + Cosmos* por entidade)
  schemas/       # Zod runtime validation
  middlewares/   # auth, role, error handler

src/                                # frontend
  components/    # shadcn/ui + componentes específicos
  pages/         # rotas (público, /student, /landlord, /admin)
  hooks/         # React Query + WS
  lib/api/       # API clients tipados
  context/       # AuthContext
  types/         # tipos partilhados
```

A camada de repositórios tem sempre duas implementações:
- `InMemory*Repository` para arranque sem cloud
- `Cosmos*Repository` para produção

A escolha acontece em `app.ts` consoante `USE_IN_MEMORY_DB`.

## Passar de in-memory para Cosmos + Azure Blob

1. **Editar `backend/.env`**:
   ```
   USE_IN_MEMORY_DB=false
   COSMOS_ENDPOINT=<...>
   COSMOS_KEY=<...>

   BLOB_USE_MOCK=false
   BLOB_CONNECTION_STRING=<...>
   ```
2. **Reiniciar o backend** (`docker compose restart backend` ou `npm --prefix backend run dev`).
   No arranque o backend:
   - cria as containers Cosmos em falta (com `partition key /id`)
   - cria as containers do Blob (`avatars`, `room-images`, `property-images`) e força **public read access** ao nível do blob, para que os `<img src="...">` funcionem sem SAS tokens
   - corre a seed automaticamente se as containers estiverem vazias

## Apagar tudo e voltar ao estado inicial

Para limpar a base de dados Cosmos e voltar a ter os 10 anúncios + 3 contas demo do seed:

```bash
npm --prefix backend run reset
```

O script percorre todas as containers Cosmos e elimina cada documento (em lotes de 10). Depois reinicia o backend para a seed entrar:

```bash
docker compose restart backend
# OU
npm --prefix backend run dev
```

**Notas**:
- O `reset` **não** apaga ficheiros já carregados no Blob Storage. Para isso, apaga manualmente os containers no Azure portal ou usa `az storage blob delete-batch`.
- O comando requer `USE_IN_MEMORY_DB=false`; em in-memory basta reiniciar o backend para "reset" automático.

## Comandos úteis

```bash
# frontend
npm run dev              # vite dev server
npm run build            # production bundle (gera erro EISDIR em main — investigar)
npm run lint             # eslint

# backend
npm --prefix backend run dev     # tsx watch
npm --prefix backend run build   # tsc → dist/
npm --prefix backend run start   # node dist/server.js
npm --prefix backend run reset   # wipe Cosmos (requires USE_IN_MEMORY_DB=false)

# docker
npm run docker:up        # build + start frontend + backend
npm run docker:down      # stop
npm run docker:logs      # tail logs
```

## Testar manualmente o WebSocket

Login como `student@uninest.local`, abre um anúncio aprovado, "Contactar senhorio" e escreve. Noutro browser/incognito, login como `landlord@uninest.local` → "Mensagens" → vê a conversa em tempo real (badge rosa no sidebar atualiza-se sozinho).

## Critérios de aceitação cumpridos

- [x] Estudantes registam-se, fazem login e pesquisam anúncios aprovados
- [x] Senhorios submetem anúncios, que ficam pendentes até aprovação
- [x] Admins aprovam, rejeitam (com motivo) ou suspendem anúncios
- [x] Estudantes guardam favoritos e contactam senhorios por mensagens internas
- [x] Estudantes denunciam anúncios suspeitos; admin gere denúncias com ações de moderação
- [x] Utilizadores bloqueados não conseguem fazer login nem enviar mensagens
- [x] UI responsiva (desktop, tablet, mobile)
- [x] WebSocket + fallback polling para entregas em tempo real
- [x] Upload de imagens com validação de tipo/tamanho client + server
- [x] Rate limiting nos endpoints sensíveis

## Limitações conhecidas

- `npm run build` (Vite production) falha com `EISDIR` em `vite:build-html` — bug pré-existente na configuração da build, não introduzido pela aplicação. `npm run dev` funciona perfeitamente.
- O WS broadcast usa um `Map` em memória — só serve uma instância de backend. Para escalar horizontalmente, substituir por Redis pub/sub ou Azure SignalR.
- Sem testes automatizados (out of scope do MVP).
- Migração de dados antigos do Cosmos não automatizada.

## Próximos passos sugeridos (pós-MVP)

- Verificação de email no registo
- Badges de senhorio verificado
- Pesquisa por mapa
- Avaliações e reviews
- Notificações por email
- Multi-language (en, pt)
- App mobile
