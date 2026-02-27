#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Deploy / Update Script
# Usage: ./vps/deploy.sh
# Syncs the project to the VPS and (re)builds via Docker Compose.
# Connects as cjoga@tutoriasuniversitarias.com using SSH key.
# ─────────────────────────────────────────────────────────────

HOST="tutoriasuniversitarias.com"
USER="cjoga"
REMOTE_DIR="/home/${USER}/app"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Files/dirs to send to the VPS
SYNC_FILES=(
  Dockerfile
  docker-compose.yml
  package.json
  package-lock.json
  .env
  server
  src
  public
  scripts
  index.html
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  nginx-proxy-config
  nginx-vhost-config
)

echo ">>> Building sync list..."
RSYNC_INCLUDES=()
for item in "${SYNC_FILES[@]}"; do
  if [ -e "${PROJECT_DIR}/${item}" ]; then
    RSYNC_INCLUDES+=("${item}")
  else
    echo "    [skip] ${item} (not found)"
  fi
done

echo ">>> Ensuring remote directory exists..."
ssh "${USER}@${HOST}" "mkdir -p ${REMOTE_DIR}"

echo ">>> Syncing project files to ${USER}@${HOST}:${REMOTE_DIR}..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  "${RSYNC_INCLUDES[@]/#/${PROJECT_DIR}/}" \
  "${USER}@${HOST}:${REMOTE_DIR}/"

echo ">>> Installing Docker if not present..."
ssh "${USER}@${HOST}" bash -s <<'REMOTE_DOCKER'
set -euo pipefail

if ! command -v docker &>/dev/null; then
  echo "=== Installing Docker ==="
  sudo apt-get update -qq
  sudo apt-get install -y -qq ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker "$USER"
  echo "=== Docker installed. You may need to re-run this script if group changes require a new session. ==="
else
  echo "=== Docker already installed ==="
fi
REMOTE_DOCKER

echo ">>> Building and deploying containers..."
ssh "${USER}@${HOST}" bash -s <<REMOTE_DEPLOY
set -euo pipefail
cd ${REMOTE_DIR}

echo "=== Pulling latest base images ==="
docker compose pull nginx-proxy acme-companion || true

echo "=== Building app image ==="
docker compose build --no-cache app

echo "=== Starting services ==="
docker compose up -d

echo "=== Cleaning up old images ==="
docker image prune -f

echo ""
echo "=== Container status ==="
docker compose ps
REMOTE_DEPLOY

echo ""
echo "============================================"
echo "  Deployment complete!"
echo "  https://www.tutoriasuniversitarias.com"
echo "============================================"
