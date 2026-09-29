#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
test -f /opt/fullstack/.env || { echo 'Missing deployment environment file; run the GitHub Actions deployment.' >&2; exit 1; }
# Also serialize manual deployments on the host.
exec 9>/opt/fullstack/deploy.lock
flock -w 1200 9

compose=(docker compose --env-file /opt/fullstack/.env -f compose.production.yml)
"${compose[@]}" config --quiet
"${compose[@]}" build --pull
"${compose[@]}" up -d --wait --wait-timeout 120 db
"${compose[@]}" run --rm --no-deps backend npm run db:migrate
"${compose[@]}" up -d --remove-orphans --wait --wait-timeout 120
"${compose[@]}" exec -T web caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
ln -sfn "$PWD" /opt/fullstack/current
echo "Deployed $(basename "$PWD")"
