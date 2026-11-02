#!/usr/bin/env bash
set -euo pipefail

# Runs on the server, as the deployment user. Expects VERSION and MONITOR_URLS.
: "${VERSION:?VERSION is not set}"
: "${MONITOR_URLS:?MONITOR_URLS is not set}"

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version: $VERSION" >&2
  exit 1
fi

IMAGE="ghcr.io/thevcrafter/isitdown:${VERSION}"

echo "Setting up swap"
if ! swapon --show | grep -q .; then
  sudo fallocate -l 1G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "Setting up Docker"
if ! command -v docker > /dev/null; then
  sudo apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io
fi
sudo systemctl enable --now docker

echo "Pulling ${IMAGE}"
sudo docker pull "$IMAGE"

echo "Starting the container"
read -r -a urls <<< "$MONITOR_URLS"
if [ "${#urls[@]}" -eq 0 ]; then
  echo "MONITOR_URLS is empty" >&2
  exit 1
fi

sudo docker rm -f isitdown > /dev/null 2>&1 || true
sudo docker run -d \
  --name isitdown \
  --restart unless-stopped \
  -p 3000:3000 \
  -v isitdown-data:/data \
  "$IMAGE" "${urls[@]}"

sleep 5
if ! sudo docker ps --filter name=isitdown --filter status=running -q | grep -q .; then
  echo "The container is not running" >&2
  sudo docker logs isitdown >&2 || true
  exit 1
fi

echo "Deployed version ${VERSION}"