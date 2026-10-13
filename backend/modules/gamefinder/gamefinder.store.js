const { DEFAULT_ROUNDS, MAX_PLAYERS, PHASES, ROOM_TTL_MS } = require('./gamefinder.constants');
const {
    createRoomCode,
    createToken,
    normalizeName,
    normalizeRoomCode,
} = require('./gamefinder.utils');

class GameFinderStore {
    constructor({ roomTtlMs = ROOM_TTL_MS } = {}) {
        this.rooms = new Map();
        this.roomTtlMs = roomTtlMs;
    }

    createRoom(displayName, maxGames = DEFAULT_ROUNDS) {
        let code;
        do {
            code = createRoomCode();
        } while (this.rooms.has(code));

        const player = this.createPlayer(displayName, true);
        const room = {
            code,
            adminId: player.id,
            maxGames,
            phase: PHASES.LOBBY,
            players: new Map([[player.id, player]]),
            shownGameIds: [],
            recommendationHistoryIds: [],
            currentGameId: null,
            votes: new Map(),
            playerAffinities: new Map(),
            playerEvidence: new Map(),
            results: [],
            winnerId: null,
            reveal: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        this.rooms.set(code, room);
        return { room, player };
    }

    createPlayer(displayName, isAdmin = false) {
        return {
            id: createToken(),
            reconnectToken: createToken(),
            displayName: normalizeName(displayName),
            isAdmin,
            connected: true,
            socketId: null,
            preferences: null,
            joinedAt: Date.now(),
        };
    }

    joinRoom(code, displayName) {
        const room = this.getRoom(code);
        if (room.phase !== PHASES.LOBBY) throw new Error('This session has already started');
        if (room.players.size >= MAX_PLAYERS) throw new Error('This room is full');

        const normalizedName = normalizeName(displayName);
        const nameTaken = [...room.players.values()].some(
            (player) => player.displayName.toLowerCase() === normalizedName.toLowerCase()
        );
        if (nameTaken) throw new Error('That display name is already in use');

        const player = this.createPlayer(normalizedName);
        room.players.set(player.id, player);
        this.touch(room);
        return { room, player };
    }

    getRoom(code) {
        const room = this.rooms.get(normalizeRoomCode(code));
        if (!room) throw new Error('Room not found');
        return room;
    }

    authenticate(code, playerId, reconnectToken) {
        const room = this.getRoom(code);
        const player = room.players.get(playerId);
        if (!player || player.reconnectToken !== reconnectToken) {
            throw new Error('Your room session could not be restored');
        }
        this.touch(room);
        return { room, player };
    }

    leaveRoom(room, playerId) {
        const player = room.players.get(playerId);
        if (!player) throw new Error('Player not found');
        if (player.isAdmin) throw new Error('The admin must delete the room');

        room.players.delete(playerId);
        room.playerAffinities?.delete(playerId);
        room.playerEvidence?.delete(playerId);
        for (const votes of room.votes.values()) votes.delete(playerId);
        this.touch(room);
        return player;
    }

    deleteRoom(room) {
        this.rooms.delete(room.code);
        return room;
    }

    connectPlayer(room, player, socketId) {
        player.connected = true;
        player.socketId = socketId;
        this.touch(room);
    }

    disconnectSocket(socketId) {
        for (const room of this.rooms.values()) {
            for (const player of room.players.values()) {
                if (player.socketId === socketId) {
                    player.connected = false;
                    player.socketId = null;
                    this.touch(room);
                    return room;
                }
            }
        }
        return null;
    }

    touch(room) {
        room.updatedAt = Date.now();
    }

    cleanup(now = Date.now()) {
        for (const [code, room] of this.rooms.entries()) {
            if (now - room.updatedAt > this.roomTtlMs) this.rooms.delete(code);
        }
    }
}

module.exports = { GameFinderStore };
