# Database population guide

This project uses PostgreSQL 17 with Sequelize migrations. Database population has two independent
parts:

1. Sequelize seeders create the three development login accounts.
2. The Game Finder refresh fills `GameFinderGames` with all multiplayer-capable Steam titles and
   rebuilds source-option counts in `gamefinder_metrics`.

The backend runs migrations automatically when it starts through Docker Compose. Population remains
an explicit operation so restarting the application does not unexpectedly modify development data.

## Populate a Docker Compose database

Start the stack from the repository root:

```bash
cd /mnt/d/Dev/fullstack
docker compose up --build -d
```

Wait until the backend is healthy:

```bash
docker compose ps
```

Run any pending migrations explicitly if needed. This is safe when the backend already ran them:

```bash
docker compose exec backend npm run db:migrate
```

### Add the development users

```bash
docker compose exec backend npm run db:seed
```

The seeder creates these accounts and ignores duplicate email addresses:

| Role  | Email               | Password    |
| ----- | ------------------- | ----------- |
| Admin | `admin@example.com` | `Admin123!` |
| Guest | `guest@example.com` | `Guest123!` |
| User  | `user@example.com`  | `User123!`  |

### Add the Game Finder catalog

Download and import the latest multiplayer-capable Steam catalog:

```bash
docker compose exec backend npm run gamefinder:refresh-catalog
```

The refresh streams the compressed upstream dataset and retains Steam rows with a valid app ID, Steam
store URL, and at least one multiplayer/co-op/PvP/split-screen category. The source does not expose
reliable exact player limits, so these games are classified as multiplayer-capable rather than
guaranteed for a particular room size. Games without a release date and games with a future release
date are excluded. Free and unknown-price games are retained.

The refresh upserts games, disables rows that no longer qualify, and rebuilds `gamefinder_metrics` in
one transaction. The metrics table contains `name`, `type`, and `count` rows for genres, tags, and
platforms. Steam categories are retained only as import metadata for multiplayer eligibility.

## Verify the populated database

Show applied migrations:

```bash
docker compose exec backend npx sequelize-cli db:migrate:status
```

Count users and enabled Game Finder games:

```bash
docker compose exec db psql -U postgres -d app_db -c \
  'SELECT COUNT(*) AS users FROM "Users"; SELECT COUNT(*) AS enabled_games FROM "GameFinderGames" WHERE enabled = true;'
```

You can also inspect the most common source options:

```bash
docker compose exec db psql -U postgres -d app_db -c \
  'SELECT type, name, count FROM gamefinder_metrics ORDER BY type, count DESC, name LIMIT 50;'
```

Verify the catalog API after the backend starts:

```bash
curl http://lvh.me:5000/api/gamefinder/catalog/options
```

The response reports `source` as `postgres`, the current game count, price bounds, and every metric
facet ordered from most used to least used.

## Populate PostgreSQL without Docker

Create `backend/.env` from `backend/.env.example`, make sure PostgreSQL is running, and make sure
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` point to the intended development
database. Then run from the repository root:

```bash
cd /mnt/d/Dev/fullstack
npm --prefix backend install
npm --prefix backend run db:migrate
npm --prefix backend run db:seed
npm --prefix backend run gamefinder:refresh-catalog
```

## Reset development data

To undo every migration, recreate the schema, and rerun only the Sequelize development seeders:

```bash
docker compose exec backend npm run db:reset
docker compose exec backend npm run gamefinder:refresh-catalog
```

For a completely fresh Docker database, including removal of the PostgreSQL volume:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend npm run db:seed
docker compose exec backend npm run gamefinder:refresh-catalog
```

`docker compose down -v` permanently deletes all data in this project's Compose-managed database.
Do not use it against data you need to retain.

## Docker credential error during image pulls

An error such as the following happens before any project Dockerfile instruction runs:

```text
error getting credentials - err: exit status 1, out: ``
```

It means Docker could not use the credential helper configured in `~/.docker/config.json`; changing
`FROM node:22` does not resolve it. On WSL with Docker Desktop, first restart Docker Desktop and make
sure WSL integration is enabled for the distribution. If the configured helper remains broken and
only anonymous public-image pulls are needed, back up the config and remove its `credsStore` entry:

```bash
cp ~/.docker/config.json ~/.docker/config.json.backup
python3 - <<'PY'
import json
from pathlib import Path

path = Path.home() / '.docker' / 'config.json'
config = json.loads(path.read_text())
config.pop('credsStore', None)
path.write_text(json.dumps(config, indent=2) + '\n')
PY
docker pull node:22
```

Run `docker login` afterward if authenticated registry access is required. Restore the backup if you
need the previous Docker Desktop credential-store configuration.
