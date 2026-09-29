# Automatic deployment to Hetzner Ubuntu

Every push to `main` (or **Actions → Deploy → Run workflow** on `main`) bootstraps
the host, writes app configuration from GitHub, uploads the exact commit, builds
the production images, runs migrations, and starts Docker Compose.

## GitHub configuration

Under **Settings → Secrets and variables → Actions → Secrets**, set:

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | Ubuntu server's public IP |
| `DEPLOY_USER` | SSH username: `deploy`, or an administrative account for bootstrap |
| `DEPLOY_SSH_KEY` | Entire private SSH key authorized for that user |
| `DEPLOY_KNOWN_HOSTS` | Verified `IP ssh-ed25519 PUBLIC_KEY` server host-key entry |
| `DB_PASSWORD` | 64 hexadecimal characters, generated with `openssl rand -hex 32` |
| `JWT_ACCESS_SECRET` | Independently generated 64 hexadecimal characters |
| `JWT_REFRESH_SECRET` | Independently generated 64 hexadecimal characters |

Add `APP_DOMAIN` as a secret or repository variable, such as `example.com` (no
protocol or path). If both exist, the secret takes precedence.
No manual `.env` creation is needed. The action writes `/opt/fullstack/.env` with
owner-only permissions on every deployment; GitHub is the source of configuration.
Do not commit secrets. Keep the database password stable after the first deployment:
changing the secret does not rotate a password in an existing PostgreSQL database.

## Server prerequisites

SSH must already work using the configured account/key, with a verified host key.
The Hetzner API token `HETZNER_ACCOUNT` cannot authenticate an Ubuntu SSH session
and is not needed by this workflow.

For a fresh **Ubuntu 24.04+** host, the SSH account must be root or have passwordless
sudo. The action installs Ubuntu's `docker.io` and `docker-compose-v2` packages,
starts Docker, grants the account Docker group access, and creates `/opt/fullstack`.
If Docker Engine/Compose are already installed, they are reused.

A `deploy` account without sudo works if it already has Docker access and owns
`/opt/fullstack`. If neither administrative access nor this existing setup is
available, an administrator must grant access once; an SSH key alone cannot grant
the account additional privileges. Docker group membership grants host-level control.

Allow inbound TCP 22, 80, and 443 through Hetzner and Ubuntu firewalls. The action
does not change firewall rules. GitHub-hosted runners must be able to reach SSH.

## Cloudflare DNS and HTTPS

Create DNS-only A records pointing to the server IP for `@`, `user`, `guest`, and
`admin`. For `APP_DOMAIN=app.example.com`, use `app`, `user.app`, `guest.app`, and
`admin.app`. Remove conflicting records; add AAAA only if IPv6 is reachable too.

Caddy obtains certificates automatically once DNS resolves and ports 80/443 are
reachable. Containers can start before DNS is configured, but HTTPS and sign-in
need working DNS. Check `https://YOUR_DOMAIN/api/health` after configuring it.

If enabling Cloudflare proxying later, use **Full (strict)** TLS and configure
Caddy's trusted Cloudflare proxy ranges so auth rate limits see individual clients.

## Operations

PostgreSQL and Caddy state persist in Docker volumes. Only ports 80/443 are
published; the database and API are private. Demo seeders are not run.

Deployments are serialized and may briefly interrupt requests. Build, migration,
and database/API health-check failures fail the workflow; there is no automatic
rollback. To redeploy, use Actions. Reverting a commit and pushing to `main`
redeploys the older app, but does not undo database migrations.

For optional troubleshooting on the server:

```sh
cd /opt/fullstack/current
docker compose --env-file /opt/fullstack/.env -f compose.production.yml ps
docker compose --env-file /opt/fullstack/.env -f compose.production.yml logs --tail=100
```

Back up PostgreSQL before schema changes. Never run `down -v` unless you intend
to delete app data. Old source releases and build cache are retained; clean up
unused releases/images periodically as disk usage grows.
