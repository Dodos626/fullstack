#!/usr/bin/env bash
set -euo pipefail

as_root() {
    if [ "$(id -u)" -eq 0 ]; then
        "$@"
    elif sudo -n true 2>/dev/null; then
        sudo -n "$@"
    else
        echo 'Initial setup needs root or passwordless sudo. Alternatively, preinstall Docker/Compose and grant this user Docker access and ownership of /opt/fullstack.' >&2
        exit 1
    fi
}

if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
    # Ubuntu 24.04+ supplies Docker Engine and Compose v2 in its repositories.
    as_root apt-get update
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2
    as_root systemctl enable --now docker
fi

if ! docker info >/dev/null 2>&1; then
    as_root systemctl start docker
    if [ "$(id -u)" -ne 0 ]; then
        as_root usermod -aG docker "$(id -un)"
    fi
    # The workflow opens a fresh SSH session after this script for group membership.
fi

if [ ! -d /opt/fullstack ] || [ ! -w /opt/fullstack ]; then
    as_root install -d -o "$(id -un)" -g "$(id -gn)" -m 755 /opt/fullstack
fi
mkdir -p /opt/fullstack/releases
