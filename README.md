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

### Ativar Cosmos DB localmente (registo persistente)

1. Editar `backend/.env`:
   - `USE_IN_MEMORY_DB=false`
   - preencher `COSMOS_ENDPOINT` e `COSMOS_KEY`
   - confirmar `COSMOS_DATABASE_ID` e `COSMOS_USERS_CONTAINER`
2. Garantir que o container de utilizadores no Cosmos usa partition key `/id`.
3. Arrancar o backend e confirmar no log:
   - `Database connection established (Cosmos DB).`

Se a ligação à base de dados falhar no arranque, o backend termina com erro para evitar correr em estado inválido.

### Validar registo no Cosmos

1. Fazer registo:
   - `POST /auth/register`
2. Repetir com o mesmo email para validar conflito:
   - esperado `409 Conflict`

### Frontend para backend

O frontend usa `VITE_API_URL` para apontar para a API.  
Se não estiver definida, usa `http://localhost:4000`.

### Docker (dev frontend + backend)

1. Criar ambiente na raiz:
   - `cp .env.example .env`
2. Configurar backend:
   - garantir que `backend/.env` existe e está com `USE_IN_MEMORY_DB=false` para Cosmos
3. Subir serviços em dev:
   - `npm run docker:up`
4. Ver logs:
   - `npm run docker:logs`
5. Parar:
   - `npm run docker:down`
