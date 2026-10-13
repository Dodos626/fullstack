const test = require('node:test');
const assert = require('node:assert/strict');
const { registerGameFinderHandlers } = require('../modules/gamefinder/gamefinder.handlers');
const { GameFinderStore } = require('../modules/gamefinder/gamefinder.store');
const { gameFinderCatalog } = require('../modules/gamefinder/catalog');

const catalogGames = [
    {
        id: 548430,
        steamAppId: 548430,
        platform: 'steam',
        name: 'Deep Rock Galactic',
        description: 'Co-op mining.',
        image: 'https://example.com/deep-rock.jpg',
        steamUrl: 'https://store.steampowered.com/app/548430',
        priceFinalUsd: 2999,
        genres: ['action'],
        tags: ['co-op'],
        categories: ['online-co-op'],
        platforms: ['win'],
    },
    {
        id: 550,
        steamAppId: 550,
        platform: 'steam',
        name: 'Left 4 Dead 2',
        description: 'Co-op zombies.',
        image: 'https://example.com/left-4-dead.jpg',
        steamUrl: 'https://store.steampowered.com/app/550',
        priceFinalUsd: 999,
        genres: ['action'],
        tags: ['zombies'],
        categories: ['online-co-op'],
        platforms: ['win'],
    },
];
gameFinderCatalog.games = catalogGames;
gameFinderCatalog.gamesById = new Map(catalogGames.map((game) => [game.id, game]));

class FakeSocket {
    constructor(id) {
        this.id = id;
        this.rooms = new Set([id]);
        this.handlers = new Map();
    }

    on(event, handler) {
        this.handlers.set(event, handler);
    }

    join(room) {
        this.rooms.add(room);
    }

    leave(room) {
        this.rooms.delete(room);
    }

    trigger(event, payload) {
        return new Promise((resolve) => {
            this.handlers.get(event)(payload, resolve);
        });
    }
}

class FakeIo {
    constructor() {
        this.connectionHandler = null;
        this.emitted = [];
    }

    on(event, handler) {
        if (event === 'connection') this.connectionHandler = handler;
    }

    connect(socket) {
        this.connectionHandler(socket);
    }

    to(target) {
        return {
            emit: (event, payload) => this.emitted.push({ target, event, payload }),
        };
    }

    in() {
        return {
            socketsLeave: () => undefined,
        };
    }
}

const credentials = (room, player) => ({
    roomCode: room.code,
    playerId: player.id,
    reconnectToken: player.reconnectToken,
});

const readyPreferences = {
    includedGenres: [],
    excludedGenres: [],
    includedTags: [],
    excludedTags: [],
    platforms: [],
    priceFilterEnabled: false,
    priceMinUsd: 0,
    priceMaxUsd: 10000,
    ratingFilterEnabled: false,
    minimumRating: 0,
    ratingCountFilterEnabled: false,
    minimumRatingCount: 0,
};

test('all votes automatically advance to the next game', async () => {
    const store = new GameFinderStore();
    const { room, player: admin } = store.createRoom('Admin', 4);
    const { player: guest } = store.joinRoom(room.code, 'Guest');
    admin.preferences = readyPreferences;
    guest.preferences = readyPreferences;
    room.phase = 'voting';
    room.currentGameId = 548430;
    room.shownGameIds = [548430];
    room.recommendationHistoryIds = [548430];
    room.votes.set(548430, new Map());

    const io = new FakeIo();
    registerGameFinderHandlers(io, store);
    const adminSocket = new FakeSocket('admin-socket');
    const guestSocket = new FakeSocket('guest-socket');
    io.connect(adminSocket);
    io.connect(guestSocket);

    const firstVote = await adminSocket.trigger('vote:submit', {
        ...credentials(room, admin),
        gameId: 548430,
        vote: 'maybe',
    });
    const secondVote = await guestSocket.trigger('vote:submit', {
        ...credentials(room, guest),
        gameId: 548430,
        vote: 'maybe',
    });

    assert.equal(firstVote.success, true);
    assert.equal(secondVote.success, true);
    assert.equal(room.phase, 'voting');
    assert.notEqual(room.currentGameId, 548430);
    assert.equal(room.shownGameIds.length, 2);
});

test('admin force skip casts neutral votes for missing players and advances', async () => {
    const store = new GameFinderStore();
    const { room, player: admin } = store.createRoom('Admin', 4);
    const { player: guest } = store.joinRoom(room.code, 'Guest');
    admin.preferences = readyPreferences;
    guest.preferences = readyPreferences;
    room.phase = 'voting';
    room.currentGameId = 548430;
    room.shownGameIds = [548430];
    room.recommendationHistoryIds = [548430];
    room.votes.set(548430, new Map([[admin.id, 'like']]));

    const io = new FakeIo();
    registerGameFinderHandlers(io, store);
    const socket = new FakeSocket('admin-socket');
    io.connect(socket);

    const response = await socket.trigger('game:skip', credentials(room, admin));

    assert.equal(response.success, true);
    assert.equal(room.votes.get(548430).get(guest.id), 'skipped');
    assert.notEqual(room.currentGameId, 548430);
});

test('non-admin player can leave the lobby through the socket command', async () => {
    const store = new GameFinderStore();
    const { room } = store.createRoom('Admin', 4);
    const { player: guest } = store.joinRoom(room.code, 'Guest');
    const io = new FakeIo();
    registerGameFinderHandlers(io, store);
    const socket = new FakeSocket('guest-socket');
    io.connect(socket);

    const response = await socket.trigger('room:leave', credentials(room, guest));

    assert.equal(response.success, true);
    assert.equal(room.players.has(guest.id), false);
});

test('leaving an active two-player session returns the room to the lobby', async () => {
    const store = new GameFinderStore();
    const { room, player: admin } = store.createRoom('Admin', 4);
    const { player: guest } = store.joinRoom(room.code, 'Guest');
    admin.preferences = readyPreferences;
    guest.preferences = readyPreferences;
    room.phase = 'voting';
    room.currentGameId = 548430;
    room.shownGameIds = [548430];
    room.recommendationHistoryIds = [548430];
    room.votes.set(548430, new Map([[admin.id, 'like']]));

    const io = new FakeIo();
    registerGameFinderHandlers(io, store);
    const socket = new FakeSocket('guest-socket');
    io.connect(socket);

    const response = await socket.trigger('room:leave', credentials(room, guest));

    assert.equal(response.success, true);
    assert.equal(room.phase, 'lobby');
    assert.equal(room.currentGameId, null);
    assert.equal(admin.preferences, null);
});

test('admin can delete the room through the socket command', async () => {
    const store = new GameFinderStore();
    const { room, player: admin } = store.createRoom('Admin', 4);
    const io = new FakeIo();
    registerGameFinderHandlers(io, store);
    const socket = new FakeSocket('admin-socket');
    io.connect(socket);

    const response = await socket.trigger('room:delete', credentials(room, admin));

    assert.equal(response.success, true);
    assert.throws(() => store.getRoom(room.code), /Room not found/);
    assert.ok(io.emitted.some((event) => event.event === 'room:deleted'));
});

test('fresh batch keeps learning and exposure while start over clears them', async () => {
    const store = new GameFinderStore();
    const { room, player: admin } = store.createRoom('Admin', 4);
    const { player: guest } = store.joinRoom(room.code, 'Guest');
    admin.preferences = readyPreferences;
    guest.preferences = readyPreferences;
    room.phase = 'results';
    room.shownGameIds = [548430];
    room.recommendationHistoryIds = [548430];
    room.playerFeatureStats.set(
        admin.id,
        new Map([
            [
                'tag:co-op',
                { signedEvidence: 1, evidence: 1, lastUpdatedRound: 1 },
            ],
        ])
    );
    room.playerLearningVoteCounts.set(admin.id, 1);

    const io = new FakeIo();
    registerGameFinderHandlers(io, store);
    const socket = new FakeSocket('admin-socket');
    io.connect(socket);

    const continued = await socket.trigger('session:continue', credentials(room, admin));
    assert.equal(continued.success, true);
    assert.equal(room.playerLearningVoteCounts.get(admin.id), 1);
    assert.equal(room.playerFeatureStats.get(admin.id).has('tag:co-op'), true);
    assert.equal(room.recommendationHistoryIds.includes(548430), true);

    room.phase = 'results';
    const restarted = await socket.trigger('session:restart', credentials(room, admin));
    assert.equal(restarted.success, true);
    assert.equal(room.playerFeatureStats.size, 0);
    assert.equal(room.playerLearningVoteCounts.size, 0);
    assert.equal(room.recommendationHistoryIds.length, 0);
    assert.equal(admin.preferences, null);
});
