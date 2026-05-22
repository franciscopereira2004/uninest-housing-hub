#!/usr/bin/env bash
#
# Azure setup script para UniNest
# Cria Storage Account, App Service Plan, Web App e configura Application Settings
# Cria do zero (ou reutiliza, se já existirem) todos os recursos necessários:
# Resource Group, Cosmos DB account (Core SQL serverless) + database,
# Storage Account + containers + queue, App Service Plan e Web App.
# Todas as operações são idempotentes — correr o script duas vezes não estraga nada.
#
# Uso:
#   chmod +x azure-setup.sh
#   ./azure-setup.sh
#
set -euo pipefail

# ============================================================
# Pre-flight — Azure CLI deve estar autenticada
# ============================================================
if ! az account show --query name -o tsv >/dev/null 2>&1; then
  echo "✗ Azure CLI não autenticada. Corre: az login" >&2
  exit 1
fi
echo "▶ Subscrição activa: $(az account show --query name -o tsv)"

# ============================================================
# CONFIGURAÇÃO — ajusta se quiseres
# ============================================================
GLOBAL_PREFIX="uninest"
RG="${GLOBAL_PREFIX}"
LOCATION="francecentral"

COSMOS_ACCOUNT="cosmos-account-${GLOBAL_PREFIX}"
COSMOS_DATABASE="uninest"

STORAGE_ACCOUNT="st${GLOBAL_PREFIX}"          # storage account names: 3-24 chars, lowercase + numbers, globalmente único
ASP_NAME="app-service-plan-${GLOBAL_PREFIX}"
APP_NAME="web-app-${GLOBAL_PREFIX}"
FUNC_APP_NAME="func-${GLOBAL_PREFIX}"
ACR_NAME="acr${GLOBAL_PREFIX}"                # ACR names: 5-50 alphanumeric, globalmente único
DOCKER_IMAGE_NAME="uninest-app"
DOCKER_IMAGE_TAG="v1"

# Containers do Blob Storage (o backend cria estes automaticamente se não existirem,
# mas criar aqui garante que existem desde o arranque)
BLOB_AVATARS="avatars"
BLOB_PROPERTIES="property-images"

# JWT secret — gerar aleatório
JWT_SECRET="$(openssl rand -hex 32)"

# Para o Deployment Center / GitHub Actions (apenas referência — o setup do GitHub
# é feito depois pelo portal, estas variáveis não são usadas pelo script).
GITHUB_REPO="https://github.com/franciscopereira2004/uninest-housing-hub"
GITHUB_BRANCH="main"

# ============================================================
# 1. Resource Group (idempotente — cria se não existir)
# ============================================================
echo "▶ Garantir Resource Group: $RG ($LOCATION)"
az group create \
  --name "$RG" \
  --location "$LOCATION" \
  > /dev/null

# ============================================================
# 2. Cosmos DB account (Core SQL, Serverless) + database
# ----------------------------------------------------
# A criação da conta Cosmos pode demorar 5-15 minutos na primeira execução.
# Em execuções seguintes (conta já existe) é praticamente instantâneo.
# As containers (users, listings, …) são criadas automaticamente pelo backend
# no arranque via assertCosmosReady — não é preciso criá-las aqui.
# ============================================================
echo "▶ Garantir Cosmos DB account: $COSMOS_ACCOUNT (serverless, pode demorar)"
az cosmosdb create \
  --name "$COSMOS_ACCOUNT" \
  --resource-group "$RG" \
  --locations regionName="$LOCATION" failoverPriority=0 isZoneRedundant=False \
  --capabilities EnableServerless \
  --default-consistency-level Session \
  > /dev/null

echo "▶ Garantir Cosmos SQL database: $COSMOS_DATABASE"
az cosmosdb sql database create \
  --account-name "$COSMOS_ACCOUNT" \
  --resource-group "$RG" \
  --name "$COSMOS_DATABASE" \
  > /dev/null

# ============================================================
# 3. Storage Account
# ============================================================
echo "▶ Criar Storage Account: $STORAGE_ACCOUNT"
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RG" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot \
  --allow-blob-public-access true \
  --min-tls-version TLS1_2

# Connection string para usar a seguir
STORAGE_CONN="$(az storage account show-connection-string \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RG" \
  --query connectionString -o tsv)"

echo "▶ Criar containers do Blob"
az storage container create --name "$BLOB_AVATARS" \
  --connection-string "$STORAGE_CONN" \
  --public-access blob

az storage container create --name "$BLOB_PROPERTIES" \
  --connection-string "$STORAGE_CONN" \
  --public-access blob

# ============================================================
# 4. App Service Plan (Linux, Basic B1)
# ============================================================
echo "▶ Criar App Service Plan: $ASP_NAME"
az appservice plan create \
  --name "$ASP_NAME" \
  --resource-group "$RG" \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux

# ============================================================
# 5. Web App (Node 22 LTS)
# =======================================================
echo "▶ Criar Web App: $APP_NAME"
az webapp create \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --plan "$ASP_NAME" \
  --runtime "NODE:22-lts"

# ============================================================
# 6. Obter Cosmos endpoint e key (para usar nas Application Settings)
# ============================================================
echo "▶ Obter Cosmos primary key"
COSMOS_ENDPOINT="$(az cosmosdb show --name "$COSMOS_ACCOUNT" --resource-group "$RG" --query documentEndpoint -o tsv)"
COSMOS_KEY="$(az cosmosdb keys list --name "$COSMOS_ACCOUNT" --resource-group "$RG" --query primaryMasterKey -o tsv)"

# ============================================================
# 7. Application Settings
# ============================================================
echo "▶ Configurar Application Settings"
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --settings \
    NODE_ENV=production \
    SERVE_FRONTEND=true \
    NPM_CONFIG_PRODUCTION=false \
    NPM_CONFIG_LEGACY_PEER_DEPS=true \
    WEBSITES_PORT=8080 \
    PORT=8080 \
    JWT_SECRET="$JWT_SECRET" \
    JWT_EXPIRES_IN=7d \
    USE_IN_MEMORY_DB=false \
    COSMOS_ENDPOINT="$COSMOS_ENDPOINT" \
    COSMOS_KEY="$COSMOS_KEY" \
    COSMOS_DATABASE_ID="$COSMOS_DATABASE" \
    COSMOS_USERS_CONTAINER=users \
    COSMOS_LISTINGS_CONTAINER=listings \
    COSMOS_FAVOURITES_CONTAINER=favourites \
    COSMOS_CONVERSATIONS_CONTAINER=conversations \
    COSMOS_MESSAGES_CONTAINER=messages \
    COSMOS_REPORTS_CONTAINER=reports \
    BLOB_USE_MOCK=false \
    BLOB_CONNECTION_STRING="$STORAGE_CONN" \
    BLOB_AVATARS_CONTAINER="$BLOB_AVATARS" \
    BLOB_PROPERTY_IMAGES_CONTAINER="$BLOB_PROPERTIES" \
    MAX_UPLOAD_SIZE_MB=5 \
    STORAGE_CONNECTION_STRING="$STORAGE_CONN" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    WEBSITE_RUN_FROM_PACKAGE=0 \
    > /dev/null

# ============================================================
# 8. Configurações gerais do site
# ============================================================
echo "▶ HTTPS Only, Web Sockets, Always On, Health Check"
az webapp update \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --https-only true \
  > /dev/null

az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --web-sockets-enabled true \
  --always-on true \
  --http20-enabled true \
  --min-tls-version 1.2 \
  > /dev/null

# --health-check-path só existe no az CLI >= 2.40. Usamos a forma genérica que
# funciona em todas as versões.
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --generic-configurations '{"healthCheckPath": "/api/health"}' \
  > /dev/null

# ============================================================
# 8b. Ligar GitHub deployment (requer GITHUB_TOKEN no ambiente)
# ----------------------------------------------------
# Para obter o token: github.com → Settings → Developer settings →
# Personal access tokens (classic) → Generate new token → scope "repo".
# Depois corre: export GITHUB_TOKEN=ghp_xxxxx && ./azure-setup.sh
# ============================================================
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  echo "▶ Configurar GitHub Actions deployment"
  az webapp deployment source config \
    --name "$APP_NAME" \
    --resource-group "$RG" \
    --repo-url "$GITHUB_REPO" \
    --branch "$GITHUB_BRANCH" \
    --github-action \
    --token "$GITHUB_TOKEN" \
    > /dev/null && echo "✅ GitHub Actions configurado"
else
  echo "ℹ GITHUB_TOKEN não definido — configurar GitHub no portal (ver PRÓXIMO PASSO)"
fi

# ============================================================
# 9. Azure Function — estatísticas (stats das últimas 24h)
# ----------------------------------------------------
# Nota: Linux Consumption Plan não convive com Web App Linux no mesmo RG
# (restrição "dynamic workers"). Por isso a Function é colocada no MESMO
# App Service Plan B1 já existente — partilha recursos com o web app mas
# fica no mesmo RG.
# ============================================================
echo "▶ Garantir Function App: $FUNC_APP_NAME (no ASP $ASP_NAME)"
az functionapp create \
  --resource-group "$RG" \
  --name "$FUNC_APP_NAME" \
  --storage-account "$STORAGE_ACCOUNT" \
  --plan "$ASP_NAME" \
  --runtime node --runtime-version 22 \
  --functions-version 4 --os-type Linux \
  > /dev/null

echo "▶ Configurar Application Settings da Function (Cosmos)"
az functionapp config appsettings set \
  --name "$FUNC_APP_NAME" \
  --resource-group "$RG" \
  --settings \
    COSMOS_ENDPOINT="$COSMOS_ENDPOINT" \
    COSMOS_KEY="$COSMOS_KEY" \
    COSMOS_DATABASE_ID="$COSMOS_DATABASE" \
    COSMOS_USERS_CONTAINER=users \
    COSMOS_LISTINGS_CONTAINER=listings \
  > /dev/null

# Deploy do código da Function: o zip tem de ser construído ANTES de correr este
# script. A partir de functions/ correr:
#   npm install && npm run build && rm -rf node_modules && npm install --omit=dev
#   zip -r ../functions-deploy.zip . -x "*.ts" "src/**/*.ts" "tsconfig.json"
if [[ -f functions-deploy.zip ]]; then
  echo "▶ Deploy da Function (functions-deploy.zip)"
  az functionapp deployment source config-zip \
    --resource-group "$RG" \
    --name "$FUNC_APP_NAME" \
    --src functions-deploy.zip \
    > /dev/null
else
  echo "ℹ functions-deploy.zip não encontrado — Function App criada mas sem código."
  echo "  Para fazer deploy depois:"
  echo "    cd functions && npm install && npm run build"
  echo "    rm -rf node_modules && npm install --omit=dev"
  echo "    zip -r ../functions-deploy.zip . -x \"*.ts\" \"src/**/*.ts\" \"tsconfig.json\""
  echo "    cd .. && az functionapp deployment source config-zip -g $RG -n $FUNC_APP_NAME --src functions-deploy.zip"
fi

# ============================================================
# 10. Azure Container Registry — build da imagem Docker
# ----------------------------------------------------
# A build corre remotamente em ACR Tasks (não usa o Docker local).
# Demora 2-5 min na primeira vez; em re-runs reutiliza camadas do cache do ACR.
# ============================================================
echo "▶ Garantir Azure Container Registry: $ACR_NAME"
az acr create \
  --resource-group "$RG" \
  --name "$ACR_NAME" \
  --sku Basic \
  --admin-enabled true \
  > /dev/null

echo "▶ Build da imagem $DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG no ACR (pode demorar)"
az acr build \
  --registry "$ACR_NAME" \
  --image "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" \
  --file Dockerfile \
  . \
  > /dev/null

ACR_IMAGE_REF="${ACR_NAME}.azurecr.io/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"

# ============================================================
# Resumo
# ============================================================
APP_URL="https://${APP_NAME}.azurewebsites.net"
FUNC_URL="https://${FUNC_APP_NAME}.azurewebsites.net"
echo ""
echo "============================================================"
echo "✅ Recursos Azure criados com sucesso"
echo "============================================================"
echo "Resource Group:   $RG"
echo "Storage Account:  $STORAGE_ACCOUNT"
echo "App Service Plan: $ASP_NAME (Linux, B1)"
echo "Web App:          $APP_NAME"
echo "URL:              $APP_URL"
echo "Cosmos:           $COSMOS_ACCOUNT (database: $COSMOS_DATABASE)"
echo "Function App:     $FUNC_APP_NAME"
echo "Function URL:     $FUNC_URL/api/stats?code=<function-key>"
echo "ACR:              $ACR_NAME ($ACR_IMAGE_REF)"
echo ""
echo "JWT_SECRET gerado e guardado nas Application Settings."
echo ""
echo "Para obter a Function key:"
echo "  az functionapp function keys list -g $RG -n $FUNC_APP_NAME --function-name stats --query default -o tsv"
echo ""
echo "PRÓXIMO PASSO:"
echo "  1. Ir ao portal Azure → $APP_NAME → Deployment Center"
echo "  2. Source: GitHub"
echo "  3. Repo: franciscopereira2004/uninest-housing-hub"
echo "  4. Branch: main"
echo "  5. Workflow: 'Add a workflow'"
echo "  6. Save → vai criar o ficheiro .github/workflows/main_app-uninest.yml no teu repo"
echo "  7. Aguarda o GitHub Action correr (5-10 min)"
echo "  8. Abre $APP_URL"
echo "============================================================"
