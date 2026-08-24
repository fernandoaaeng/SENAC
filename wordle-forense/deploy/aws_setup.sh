#!/usr/bin/env bash
# Liberar a porta 80 só para o IP da sala (Security Group da EC2).
# Uso:
#   export SALA_IP=200.x.x.x/32
#   export SG_ID=sg-xxxxxxxx
#   ./deploy/aws_setup.sh allow
#   ./deploy/aws_setup.sh revoke
#
# AVISO: o app é intencionalmente vulnerável. Liberar NA HORA da aula e revogar depois.

set -euo pipefail

ACTION="${1:-}"
SALA_IP="${SALA_IP:-}"
SG_ID="${SG_ID:-}"

if [[ -z "$ACTION" || -z "$SALA_IP" || -z "$SG_ID" ]]; then
  echo "Uso: SALA_IP=x.x.x.x/32 SG_ID=sg-... $0 allow|revoke"
  exit 1
fi

if [[ "$ACTION" == "allow" ]]; then
  aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 80 \
    --cidr "$SALA_IP"
  echo "Porta 80 liberada para $SALA_IP"
elif [[ "$ACTION" == "revoke" ]]; then
  aws ec2 revoke-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 80 \
    --cidr "$SALA_IP"
  echo "Regra revogada para $SALA_IP"
else
  echo "Ação inválida: $ACTION (use allow ou revoke)"
  exit 1
fi

cat <<'STEPS'

--- Passos da VM (Ubuntu / EC2) ---
1. Instalar Docker:
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER   # relogue depois

2. Copiar este repositório para a VM e, na pasta wordle-forense:
   docker compose up -d --build

3. Abrir http://<IP_PUBLICO_DA_VM> apenas a partir da rede da sala.

4. Ao final da aula: ./deploy/aws_setup.sh revoke  e/ou  sudo shutdown now

STEPS
