#!/usr/bin/env bash
# Liberar a porta 80 só para o IP da sala (NSG da Azure VM).
# Uso:
#   export SALA_IP=200.x.x.x/32
#   export RG=nome-do-resource-group
#   export NSG=nome-do-nsg
#   ./deploy/azure_setup.sh allow
#   ./deploy/azure_setup.sh revoke
#
# AVISO: o app é intencionalmente vulnerável. Liberar NA HORA da aula e revogar depois.

set -euo pipefail

ACTION="${1:-}"
SALA_IP="${SALA_IP:-}"
RG="${RG:-}"
NSG="${NSG:-}"
RULE_NAME="${RULE_NAME:-AllowSala80}"

if [[ -z "$ACTION" || -z "$SALA_IP" || -z "$RG" || -z "$NSG" ]]; then
  echo "Uso: SALA_IP=x.x.x.x/32 RG=... NSG=... $0 allow|revoke"
  exit 1
fi

if [[ "$ACTION" == "allow" ]]; then
  az network nsg rule create \
    --resource-group "$RG" \
    --nsg-name "$NSG" \
    --name "$RULE_NAME" \
    --priority 200 \
    --direction Inbound \
    --access Allow \
    --protocol Tcp \
    --destination-port-ranges 80 \
    --source-address-prefixes "$SALA_IP"
  echo "Porta 80 liberada para $SALA_IP"
elif [[ "$ACTION" == "revoke" ]]; then
  az network nsg rule delete \
    --resource-group "$RG" \
    --nsg-name "$NSG" \
    --name "$RULE_NAME"
  echo "Regra $RULE_NAME removida"
else
  echo "Ação inválida: $ACTION (use allow ou revoke)"
  exit 1
fi

cat <<'STEPS'

--- Passos da VM (Ubuntu / Azure) ---
1. Instalar Docker:
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER

2. Na pasta wordle-forense:
   docker compose up -d --build

3. Abrir http://<IP_PUBLICO_DA_VM> apenas a partir da rede da sala.

4. Ao final da aula: ./deploy/azure_setup.sh revoke  e/ou desligar a VM.

STEPS
