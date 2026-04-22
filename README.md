# UniNest Housing Hub

Projeto frontend com Vite + React.

## Backend (Fastify + Azure)

Foi adicionada uma API em `backend/` com arquitetura por camadas:

- `routes`
- `controllers`
- `services`
- `repositories`
- `middlewares`

### Tecnologias backend

- Fastify + TypeScript
- JWT para autenticação
- Azure CosmosDB para dados
- Azure Blob Storage para uploads de imagens

### Arrancar backend localmente

1. Criar ficheiro de ambiente:
   - `cp backend/.env.example backend/.env`
2. Instalar dependências:
   - `npm --prefix backend install`
3. Iniciar em modo desenvolvimento:
   - `npm --prefix backend run dev`

Por omissão, o backend arranca com `USE_IN_MEMORY_DB=true` e `BLOB_USE_MOCK=true`.

### Frontend para backend

O frontend usa `VITE_API_URL` para apontar para a API.  
Se não estiver definida, usa `http://localhost:4000`.

### Docker (dev frontend + backend)

1. Criar ambiente na raiz:
   - `cp .env.example .env`
2. Subir serviços em dev:
   - `npm run docker:up`
3. Ver logs:
   - `npm run docker:logs`
4. Parar:
   - `npm run docker:down`
