#!/usr/bin/env bash
#
# Azure teardown — apaga o Resource Group inteiro do UniNest.
# DESTRUTIVO E IRREVERSÍVEL. Apaga Web App, Function App, Cosmos DB, Storage,
# ACR e qualquer outro recurso dentro do RG.
#
# Uso:
#   chmod +x azure-teardown.sh
#   ./azure-teardown.sh
#
set -e

RG="uninest"

echo "⚠  Vais apagar o Resource Group '$RG' e TODOS os recursos dentro."
echo "    Esta acção é IRREVERSÍVEL."
echo ""
read -r -p "Para confirmar, escreve exactamente '$RG': " CONFIRM

if [[ "$CONFIRM" != "$RG" ]]; then
  echo "✗ Cancelado (input não coincide)."
  exit 1
fi

echo "▶ A apagar Resource Group '$RG' (--no-wait)..."
az group delete --name "$RG" --yes --no-wait
echo "✅ Pedido de delete submetido. A operação continua em background no Azure."
echo "   Para confirmar quando terminar:"
echo "     az group exists --name $RG    # devolve false quando o RG já não existe"
