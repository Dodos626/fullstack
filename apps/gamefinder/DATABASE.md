# Persisting Game Finder in PostgreSQL

Game Finder currently keeps active rooms in process memory through
`backend/modules/gamefinder/gamefinder.store.js`. This is intentionally fast for the prototype, but
rooms disappear when the backend restarts and the server cannot safely run more than one replica.
This document describes the planned migration to the repository's existing PostgreSQL 17 and
Sequelize 6 stack.

## Goals

- Preserve rooms, participants, private preferences, rounds, votes, and results across restarts.
- Keep reconnect tokens private and revocable.
- Make every state transition transactional and server-authoritative.
- Allow multiple backend instances without maintaining separate copies of room state.
- Retain the existing Socket.IO protocol so the frontend does not need a second rewrite.

## Proposed tables

`GameFinderGames` has now been implemented for the enabled catalog. The room, player, round, vote,
and similarity tables below remain the next persistence stages.

### `GameFinderGames` (implemented)

Steam app ID is the primary key. The table stores source-backed Steam metadata and enabled status for
every row with a valid Steam store URL and the exact `Multi-player` source category. Exact player limits are not
stored because SteamDB does not provide a reliable structured capacity value. Rows without a release
date or with a future release date are disabled during refresh.

### `gamefinder_metrics` (implemented)

This table stores `(type, name, count)` rows for every enabled genre, tag, and platform represented
by enabled games. It is rebuilt transactionally after each successful catalog refresh and drives the
questionnaire options. Steam categories remain catalog metadata used only to identify multiplayer-
capable games during import.

### `GameFinderRooms`

| Column          | Type              | Notes                                         |
| --------------- | ----------------- | --------------------------------------------- |
| `id`            | UUID              | Primary key                                   |
| `code`          | STRING(6)         | Unique public room code                       |
| `adminPlayerId` | UUID              | Foreign key to `GameFinderPlayers`            |
| `phase`         | ENUM              | `lobby`, `questionnaire`, `voting`, `results` |
| `maxGames`      | INTEGER           | Four through twelve                           |
| `currentGameId` | INTEGER, nullable | Steam app ID from the enabled catalog         |
| `winnerGameId`  | INTEGER, nullable | Unanimous winner when one exists              |
| player affinity | JSONB             | Per-player typed-feature weights and evidence |
| `expiresAt`     | DATE              | Replaces in-memory TTL cleanup                |
| timestamps      | DATE              | Sequelize `createdAt` and `updatedAt`         |

The enabled Steam catalog is stored in PostgreSQL using Steam app ID as its stable key. Source arrays
use PostgreSQL arrays with GIN indexes for fields used by filtering and recommendation.

### `GameFinderPlayers`

| Column               | Type            | Notes                                             |
| -------------------- | --------------- | ------------------------------------------------- |
| `id`                 | UUID            | Public opaque player ID                           |
| `roomId`             | UUID            | Foreign key with cascade delete                   |
| `displayName`        | STRING(24)      | Unique case-insensitively within a room           |
| `isAdmin`            | BOOLEAN         | Exactly one player per room                       |
| `reconnectTokenHash` | STRING          | Hash the browser token; never store the raw value |
| `preferences`        | JSONB, nullable | Private questionnaire payload                     |
| `lastSeenAt`         | DATE            | Reconnect and cleanup support                     |
| timestamps           | DATE            | Audit fields                                      |

`connected` and `socketId` stay ephemeral. Connection presence belongs in Socket.IO/Redis, not in
PostgreSQL.

### `GameFinderRounds`

| Column            | Type           | Notes                                       |
| ----------------- | -------------- | ------------------------------------------- |
| `id`              | UUID           | Primary key                                 |
| `roomId`          | UUID           | Foreign key with cascade delete             |
| `gameId`          | INTEGER        | Steam app ID                                |
| `roundNumber`     | INTEGER        | Unique with `roomId`                        |
| `preferenceScore` | DECIMAL        | Versioned next-game score at selection time |
| `revealedAt`      | DATE, nullable | Set when voting closes or the admin skips   |
| `wasForced`       | BOOLEAN        | True for an admin force-skip                |
| timestamps        | DATE           | Audit fields                                |

### `GameFinderVotes`

| Column     | Type     | Notes                                          |
| ---------- | -------- | ---------------------------------------------- |
| `id`       | UUID     | Primary key                                    |
| `roundId`  | UUID     | Foreign key with cascade delete                |
| `playerId` | UUID     | Foreign key with cascade delete                |
| `value`    | ENUM     | `like`, `maybe`, `dislike`, `skipped`          |
| `score`    | SMALLINT | Aggregate display score for the submitted vote |
| timestamps | DATE     | Submission time                                |

Add a unique constraint on `(roundId, playerId)` so retries cannot create duplicate votes.

### Optional `GameFinderResults`

Final results can be calculated from rounds and votes. Store a JSONB snapshot only if historical
results must remain identical after the recommendation algorithm changes.

## Remaining Sequelize implementation order

1. Keep `GameFinderGames` refreshed with `npm --prefix backend run gamefinder:refresh-catalog`.
2. Add four migrations in `backend/migrations`, creating rooms, players, rounds, and votes.
3. Add matching models in `backend/models` and register them in `backend/models/index.js`.
4. Define associations:
    - Room has many Players and Rounds.
    - Player belongs to Room and has many Votes.
    - Round belongs to Room and has many Votes.
    - Vote belongs to Player and Round.
5. Introduce a store interface consumed by `gamefinder.handlers.js`.
6. Rename the current class to `InMemoryGameFinderStore` and add
   `PostgresGameFinderStore` implementing the same operations.
7. Select the implementation with an environment variable such as
   `GAMEFINDER_STORE=memory|postgres` during rollout.

## Transaction boundaries

Every mutating Socket.IO command should run in a Sequelize transaction:

```js
await sequelize.transaction(async (transaction) => {
    const room = await GameFinderRoom.findOne({
        where: { code },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    // Validate phase/admin/player, write the vote, and advance the round here.
});
```

Locking the room row prevents two final votes, a final vote and force-skip, or two admin actions from
advancing the session twice. Emit Socket.IO state only after the transaction commits.

## Command mapping

- `room:create`: insert room and admin player in one transaction.
- `room:join`: lock the room, validate lobby/capacity/name, then insert player.
- `room:resume`: look up player and compare the submitted reconnect token to its stored hash.
- `room:leave`: delete a non-admin player and their votes, then re-evaluate whether the current phase can advance. If fewer than two players remain, reset the room to the lobby.
- `room:delete`: delete the room; foreign-key cascades remove players, rounds, and votes.
- `preferences:submit`: update only that player's private JSONB preferences.
- `vote:submit`: insert one vote, count votes for the round, and advance atomically when complete.
- `game:skip`: insert `skipped` votes for every missing player and advance in the same transaction.
- `session:continue` and `session:restart`: update room state and create/reset round history atomically.

## Privacy and security

- Hash reconnect tokens with SHA-256 or bcrypt before storing them.
- Never return preference JSONB through `serializeRoom` for another player.
- Do not expose individual vote rows before the round closes.
- Keep authorization checks inside the same transaction as the write.
- Rate-limit room creation, joining, and reconnect attempts.
- Consider expiring reconnect tokens when a player leaves or a room is restarted.

## Cleanup

Run a scheduled task that deletes rooms whose `expiresAt` is in the past. Cascading foreign keys
remove dependent records. A simple first version can run from the backend every 30 minutes; a public
multi-instance deployment should use one dedicated worker or a database-backed job runner.

## Multiple backend instances

PostgreSQL makes room state durable, but Socket.IO broadcasts also need a shared adapter. Add the
Socket.IO Redis adapter and publish state after committed transactions. Redis should hold connection
presence and cross-instance broadcasts; PostgreSQL remains the source of truth for room state.

## Later: game-to-game similarity

The current adaptive queue transfers each player's votes through typed Steam genres, tags, and
platforms using frequency-aware feature weights. A later optimization could persist a precomputed
neighbor list for every Steam game:

1. Build a weighted feature set from normalized genres, community tags, and platforms.
2. Compute weighted Jaccard or cosine similarity between eligible games during catalog generation.
3. Store the top 20–50 neighbors per game with a similarity score.
4. When game A closes, multiply its normalized group vote by `similarity(A, B)` and add that value to
   unshown game B.
5. Positive votes therefore surface close neighbors; dislikes suppress them; neutral force-skips make
   no change.

This can initially be a generated JSON artifact beside the SteamDB subset. If moved into PostgreSQL,
use a `GameFinderGameSimilarities(sourceGameId, targetGameId, score, algorithmVersion)` table with a
unique constraint on the source/target pair. Versioning is important so recommendations can be
recomputed when feature weights change.

## Migration rollout

1. Implement and test the Sequelize models without changing the production store.
2. Add integration tests against `DB_TEST_NAME` for concurrent final votes and force-skips.
3. Enable the PostgreSQL store locally with `GAMEFINDER_STORE=postgres`.
4. Run both stores behind the same handler contract and compare serialized output.
5. Deploy migrations before enabling the PostgreSQL store.
6. Enable Redis before scaling the backend beyond one instance.

## Required tests

- Room creation and deletion cascade.
- Case-insensitive room display-name uniqueness.
- Reconnect-token hashing and rejection of invalid tokens.
- Duplicate-vote unique constraint.
- Concurrent final votes advance exactly once.
- Concurrent vote and force-skip advance exactly once.
- Preferences and hidden votes never appear in public serialization.
- Expired-room cleanup removes dependent data.
