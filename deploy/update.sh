#!/bin/sh
# Pull the latest code and restart the site (migrations run automatically).
set -e
cd "$(dirname "$0")/.."
git pull
docker compose up -d --build
docker image prune -f
echo "✓ updated"
