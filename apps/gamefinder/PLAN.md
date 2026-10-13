# Game Finder Implementation Plan

## Product

Build **What the Hell Are We Playing?**, a real-time multiplayer preference-discovery and voting app. A group creates a room, privately answers a questionnaire, votes on one Steam game at a time, and receives either an immediate unanimous winner or an explainable ranked result.

## Architecture

- Frontend: Next.js App Router, React, JavaScript, and CSS Modules in `apps/gamefinder`.
- Delivery: static Next.js export served at `gamefinder.<domain>`.
- Realtime backend: Socket.IO attached to the existing Express HTTP server.
- State: active rooms held in server memory for the MVP.
- Catalog: all Steam rows from `leinstay/steamdb` with a valid store URL and a multiplayer-related Steam category, refreshed directly into PostgreSQL.
- Theme: portfolio colors, typography, surfaces, and the persistent `themeMode` day/night preference.

## User flow

1. Create a room or join with a six-character code/invite link.
2. The creator becomes admin and configures the maximum number of games.
3. The admin starts once at least two players are present, locking membership.
4. Every player privately selects included/excluded genres, tags, multiplayer categories, platforms, and an optional price range.
5. The server filters and ranks eligible multiplayer-capable Steam games from source-backed metadata.
6. Players privately vote Like, Maybe, or Dislike; only completion progress is visible until everyone votes.
7. A unanimous Like ends immediately. Otherwise, votes update tag affinity and the server adaptively selects the next game.
8. At the round limit, the server returns ranked results and human-readable reasons.
9. The admin can continue with existing preferences or restart the room completely.

## Session rules

- Anonymous public rooms; portfolio authentication is not required.
- Two to eight players.
- Four to twelve voting rounds; default eight.
- Display names are trimmed, bounded, and unique within a room.
- Reconnect credentials are stored in the browser and restore answers/votes after a disconnect.
- Disconnected players remain part of an active session so a transient disconnect does not destroy their work.
- The admin alone can start, end, continue, or restart a session.
- Non-admin players can leave at any time. Their votes are removed from the active room state; the admin deletes the room instead of leaving it ownerless.
- If a departure leaves fewer than two players, the room returns to the lobby and resets the active session.
- The admin can force-skip an active game; every missing vote is recorded as a neutral `0` vote.
- Completed voting rounds automatically advance to the next recommendation unless they end the session.
- Inactive rooms expire from memory.

## Price behavior

- Price ranges are private and per player.
- Players can optionally choose minimum and maximum prices, a minimum positive Steam rating, and a
  minimum Steam review count.
- Filtering uses the catalog's `priceFinalUsd` value in cents.
- Unknown price or review data remains eligible unless a player explicitly enables the related
  filter.
- A game outside even one player's selected range is excluded.
- The UI identifies prices as snapshot data and links to Steam for verification.

## Recommendation model

1. Exclude non-Steam games, previously shown games, selected exclusions, platform mismatches, and games outside an enabled price range.
2. Score included genres, tags, and Steam multiplayer categories.
3. Treat excluded genres, tags, and categories as hard filters.
4. Apply a small review-confidence bonus.
5. Learn a separate typed-feature affinity profile for every player from Like, Maybe, and Dislike votes.
6. Aggregate predictions using mean utility, weakest-player utility, and a disagreement penalty.
7. Add decaying exploration and a recent-game diversity penalty.
8. Return only the top three final results with comparative explanations and score breakdowns.

## Realtime contract

Client commands:

- `room:create`
- `room:join`
- `room:resume`
- `room:leave`
- `room:delete`
- `session:start`
- `preferences:submit`
- `vote:submit`
- `game:skip`
- `session:end`
- `session:continue`
- `session:restart`

Server events:

- `room:state`
- `game:revealed`
- `session:results`
- `room:error`
- `room:deleted`

Every command uses an acknowledgement shaped as either `{ success: true, data }` or `{ success: false, message }`. The server validates every command and never exposes another player's answers or an unrevealed vote.

## Repository integration

- Make Apps the rightmost portfolio navigation tab.
- Show Game Finder first on the portfolio Apps page.
- Use `http://gamefinder.lvh.me:5175` in development.
- Add Game Finder to backend app registration and CORS.
- Add root scripts and a Docker Compose development service.
- Add a production build stage and Caddy host for `gamefinder.<APP_DOMAIN>`.
- Reverse proxy `/socket.io/*` from the Game Finder host to the existing backend.

## Validation

- Unit-test filtering, preference scoring, adaptive ordering, unanimous winners, results, authorization, privacy serialization, continue/restart, reconnects, and cleanup-relevant behavior.
- Run backend tests and lint.
- Run Game Finder lint and static production build.
- Run portfolio lint/build and root build/test scripts.
- Smoke-test local HTTP delivery and the Socket.IO handshake where possible.

## Dataset attribution

The source catalog is `https://github.com/leinstay/steamdb`, distributed under GPL-3.0. Steam names, images, descriptions, and prices remain the property of their respective publishers and sources.

Run `npm --prefix backend run gamefinder:refresh-catalog` to stream the latest compressed SteamDB
release directly into PostgreSQL. The same transaction rebuilds `gamefinder_metrics`, and
`GET /api/gamefinder/catalog/options` serves facets ordered by their game counts.
