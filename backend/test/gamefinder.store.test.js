const test = require('node:test');
const assert = require('node:assert/strict');
const { GameFinderStore } = require('../modules/gamefinder/gamefinder.store');

test('creator is the room admin and can reconnect', () => {
    const store = new GameFinderStore();
    const { room, player } = store.createRoom('Theo', 8);

    assert.equal(room.adminId, player.id);
    assert.equal(player.isAdmin, true);
    assert.equal(store.authenticate(room.code, player.id, player.reconnectToken).player, player);
});

test('duplicate display names are rejected case-insensitively', () => {
    const store = new GameFinderStore();
    const { room } = store.createRoom('Theo', 8);

    assert.throws(() => store.joinRoom(room.code, '  THEO  '), /already in use/);
});

test('non-admin players can leave the lobby', () => {
    const store = new GameFinderStore();
    const { room } = store.createRoom('Theo', 8);
    const { player } = store.joinRoom(room.code, 'Alex');

    store.leaveRoom(room, player.id);

    assert.equal(room.players.has(player.id), false);
});

test('admin must delete the room instead of leaving', () => {
    const store = new GameFinderStore();
    const { room, player } = store.createRoom('Theo', 8);

    assert.throws(() => store.leaveRoom(room, player.id), /admin must delete/);
});

test('players can leave after the session starts and their votes are removed', () => {
    const store = new GameFinderStore();
    const { room } = store.createRoom('Theo', 8);
    const { player } = store.joinRoom(room.code, 'Alex');
    room.phase = 'questionnaire';
    room.votes.set(548430, new Map([[player.id, 'like']]));

    store.leaveRoom(room, player.id);

    assert.equal(room.players.has(player.id), false);
    assert.equal(room.votes.get(548430).has(player.id), false);
});

test('leaving removes the player learning model without changing other players', () => {
    const store = new GameFinderStore();
    const { room, player: admin } = store.createRoom('Theo', 8);
    const { player } = store.joinRoom(room.code, 'Alex');
    room.playerFeatureStats.set(player.id, new Map([['tag:co-op', { evidence: 1 }]]));
    room.playerFeatureStats.set(admin.id, new Map([['tag:action', { evidence: 1 }]]));
    room.playerLearningVoteCounts.set(player.id, 2);
    room.playerLearningVoteCounts.set(admin.id, 3);

    store.leaveRoom(room, player.id);

    assert.equal(room.playerFeatureStats.has(player.id), false);
    assert.equal(room.playerLearningVoteCounts.has(player.id), false);
    assert.equal(room.playerFeatureStats.has(admin.id), true);
    assert.equal(room.playerLearningVoteCounts.get(admin.id), 3);
});

test('deleting a room invalidates future reconnects', () => {
    const store = new GameFinderStore();
    const { room, player } = store.createRoom('Theo', 8);

    store.deleteRoom(room);

    assert.throws(
        () => store.authenticate(room.code, player.id, player.reconnectToken),
        /Room not found/
    );
});

test('room cleanup removes expired rooms', () => {
    const store = new GameFinderStore({ roomTtlMs: 100 });
    const { room } = store.createRoom('Theo', 8);
    room.updatedAt = 0;

    store.cleanup(101);

    assert.throws(() => store.getRoom(room.code), /Room not found/);
});
