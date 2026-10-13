const { gameFinderCatalog } = require('./catalog');
const { applyVoteLearning, rankResults, selectNextGame } = require('./gamefinder.engine');
const { MIN_PLAYERS, PHASES } = require('./gamefinder.constants');
const {
    createRoomSchema,
    joinRoomSchema,
    preferencesSubmitSchema,
    resumeRoomSchema,
    roomActionSchema,
    voteSubmitSchema,
} = require('./gamefinder.schemas');
const { serializeRoom } = require('./gamefinder.serializer');
const { parsePayload } = require('./gamefinder.utils');

const success = (data = null) => ({ success: true, data });
const failure = (error) => ({ success: false, message: error.message || 'Something went wrong' });

const registerGameFinderHandlers = (io, store) => {
    const getGames = () => gameFinderCatalog.getGames();
    const getGamesById = () => gameFinderCatalog.getGamesById();
    const getFeatureWeights = () => gameFinderCatalog.getFeatureWeights();
    const emitRoom = (room) => {
        for (const player of room.players.values()) {
            if (player.socketId) {
                io.to(player.socketId).emit(
                    'room:state',
                    serializeRoom(room, player.id, getGamesById())
                );
            }
        }
    };

    const joinSocket = (socket, room, player) => {
        for (const joinedRoom of socket.rooms) {
            if (joinedRoom !== socket.id) socket.leave(joinedRoom);
        }
        socket.join(room.code);
        store.connectPlayer(room, player, socket.id);
    };

    const authenticate = (payload, schema = roomActionSchema) => {
        const data = parsePayload(schema, payload);
        return {
            ...data,
            ...store.authenticate(data.roomCode, data.playerId, data.reconnectToken),
        };
    };

    const requireAdmin = (room, player) => {
        if (room.adminId !== player.id) throw new Error('Only the room admin can do that');
    };

    const beginVoting = (room) => {
        const nextGame = selectNextGame(room, getGames(), getFeatureWeights());
        if (!nextGame) {
            room.results = rankResults(room, getGamesById(), getFeatureWeights());
            room.phase = PHASES.RESULTS;
            room.currentGameId = null;
            return;
        }
        room.currentGameId = nextGame.id;
        room.shownGameIds.push(nextGame.id);
        room.recommendationHistoryIds.push(nextGame.id);
        room.votes.set(nextGame.id, new Map());
        room.reveal = null;
        room.phase = PHASES.VOTING;
    };

    const finishVotingRound = (room) => {
        const gameId = room.currentGameId;
        const game = getGamesById().get(gameId);
        const summary = applyVoteLearning(room, game, getFeatureWeights());
        room.results = rankResults(room, getGamesById(), getFeatureWeights());
        room.reveal = {
            game,
            voteSummary: summary,
            compatibility: 0,
            reasons: [],
            explanation: null,
            scoreBreakdown: null,
        };

        io.to(room.code).emit('game:revealed', {
            gameId,
            voteSummary: summary,
        });

        if (summary.like === room.players.size) {
            room.winnerId = gameId;
            room.phase = PHASES.RESULTS;
            room.currentGameId = null;
            io.to(room.code).emit('session:results', { winnerId: room.winnerId });
            return;
        }

        if (room.shownGameIds.length >= room.maxGames) {
            room.phase = PHASES.RESULTS;
            room.currentGameId = null;
            io.to(room.code).emit('session:results', { winnerId: null });
            return;
        }

        beginVoting(room);
    };

    const clearSocketRoom = (socket, roomCode) => {
        socket.leave(roomCode);
    };

    const withAck = async (ack, action) => {
        try {
            ack?.(success(await action()));
        } catch (error) {
            ack?.(failure(error));
        }
    };

    io.on('connection', (socket) => {
        socket.on('room:create', (payload, ack) =>
            withAck(ack, () => {
                const data = parsePayload(createRoomSchema, payload);
                const { room, player } = store.createRoom(data.displayName, data.maxGames);
                joinSocket(socket, room, player);
                emitRoom(room);
                return {
                    roomCode: room.code,
                    playerId: player.id,
                    reconnectToken: player.reconnectToken,
                    state: serializeRoom(room, player.id, getGamesById()),
                };
            })
        );

        socket.on('room:join', (payload, ack) =>
            withAck(ack, () => {
                const data = parsePayload(joinRoomSchema, payload);
                const { room, player } = store.joinRoom(data.roomCode, data.displayName);
                joinSocket(socket, room, player);
                emitRoom(room);
                return {
                    roomCode: room.code,
                    playerId: player.id,
                    reconnectToken: player.reconnectToken,
                    state: serializeRoom(room, player.id, getGamesById()),
                };
            })
        );

        socket.on('room:resume', (payload, ack) =>
            withAck(ack, () => {
                const data = parsePayload(resumeRoomSchema, payload);
                const { room, player } = store.authenticate(
                    data.roomCode,
                    data.playerId,
                    data.reconnectToken
                );
                joinSocket(socket, room, player);
                emitRoom(room);
                return { state: serializeRoom(room, player.id, getGamesById()) };
            })
        );

        socket.on('room:leave', (payload, ack) =>
            withAck(ack, () => {
                const { room, player } = authenticate(payload);
                const roomCode = room.code;
                store.leaveRoom(room, player.id);
                clearSocketRoom(socket, roomCode);

                if (room.players.size < MIN_PLAYERS && room.phase !== PHASES.LOBBY) {
                    room.phase = PHASES.LOBBY;
                    room.currentGameId = null;
                    room.votes = new Map();
                    room.shownGameIds = [];
                    room.recommendationHistoryIds = [];
                    room.playerFeatureStats = new Map();
                    room.playerLearningVoteCounts = new Map();
                    room.recommendationDecisions = [];
                    room.results = [];
                    room.reveal = null;
                    room.winnerId = null;
                    for (const member of room.players.values()) member.preferences = null;
                } else if (
                    room.phase === PHASES.QUESTIONNAIRE &&
                    [...room.players.values()].every((member) => member.preferences)
                ) {
                    beginVoting(room);
                } else if (
                    room.phase === PHASES.VOTING &&
                    room.votes.get(room.currentGameId)?.size === room.players.size
                ) {
                    finishVotingRound(room);
                } else if (room.phase === PHASES.RESULTS) {
                    room.results = rankResults(room, getGamesById(), getFeatureWeights());
                }

                emitRoom(room);
                return { roomCode };
            })
        );

        socket.on('room:delete', (payload, ack) =>
            withAck(ack, () => {
                const { room, player } = authenticate(payload);
                requireAdmin(room, player);
                const roomCode = room.code;
                io.to(roomCode).emit('room:deleted', {
                    roomCode,
                    message: 'The admin deleted this room.',
                });
                io.in(roomCode).socketsLeave(roomCode);
                store.deleteRoom(room);
                return { roomCode };
            })
        );

        socket.on('session:start', (payload, ack) =>
            withAck(ack, async () => {
                const { room, player } = authenticate(payload);
                requireAdmin(room, player);
                if (room.phase !== PHASES.LOBBY) throw new Error('The session has already started');
                if (room.players.size < MIN_PLAYERS)
                    throw new Error('At least two players are required');
                await gameFinderCatalog.load();
                room.phase = PHASES.QUESTIONNAIRE;
                room.reveal = null;
                store.touch(room);
                emitRoom(room);
                return serializeRoom(room, player.id, getGamesById());
            })
        );

        socket.on('preferences:submit', (payload, ack) =>
            withAck(ack, () => {
                const { room, player, preferences } = authenticate(
                    payload,
                    preferencesSubmitSchema
                );
                if (room.phase !== PHASES.QUESTIONNAIRE)
                    throw new Error('Preferences are not being collected now');
                gameFinderCatalog.validatePreferences(preferences);
                player.preferences = preferences;
                const allReady = [...room.players.values()].every((member) => member.preferences);
                if (allReady) beginVoting(room);
                store.touch(room);
                emitRoom(room);
                return serializeRoom(room, player.id, getGamesById());
            })
        );

        socket.on('vote:submit', (payload, ack) =>
            withAck(ack, () => {
                const { room, player, gameId, vote } = authenticate(payload, voteSubmitSchema);
                if (room.phase !== PHASES.VOTING || room.currentGameId !== gameId) {
                    throw new Error('That game is not open for voting');
                }
                const gameVotes = room.votes.get(gameId);
                if (gameVotes.has(player.id)) throw new Error('You already voted on this game');
                gameVotes.set(player.id, vote);

                if (gameVotes.size === room.players.size) {
                    finishVotingRound(room);
                }

                store.touch(room);
                emitRoom(room);
                return serializeRoom(room, player.id, getGamesById());
            })
        );

        socket.on('game:skip', (payload, ack) =>
            withAck(ack, () => {
                const { room, player } = authenticate(payload);
                requireAdmin(room, player);
                if (room.phase !== PHASES.VOTING || !room.currentGameId) {
                    throw new Error('There is no active game to skip');
                }

                const gameVotes = room.votes.get(room.currentGameId);
                for (const member of room.players.values()) {
                    if (!gameVotes.has(member.id)) gameVotes.set(member.id, 'skipped');
                }
                finishVotingRound(room);
                store.touch(room);
                emitRoom(room);
                return serializeRoom(room, player.id, getGamesById());
            })
        );

        socket.on('session:end', (payload, ack) =>
            withAck(ack, () => {
                const { room, player } = authenticate(payload);
                requireAdmin(room, player);
                if (!room.shownGameIds.length) throw new Error('Vote on at least one game first');
                room.results = rankResults(room, getGamesById(), getFeatureWeights());
                room.phase = PHASES.RESULTS;
                room.currentGameId = null;
                store.touch(room);
                emitRoom(room);
                io.to(room.code).emit('session:results', { winnerId: null });
                return serializeRoom(room, player.id, getGamesById());
            })
        );

        socket.on('session:continue', (payload, ack) =>
            withAck(ack, () => {
                const { room, player } = authenticate(payload);
                requireAdmin(room, player);
                if (room.phase !== PHASES.RESULTS) throw new Error('Results are not available yet');
                room.votes = new Map();
                room.shownGameIds = [];
                room.results = [];
                room.reveal = null;
                room.winnerId = null;
                beginVoting(room);
                store.touch(room);
                emitRoom(room);
                return serializeRoom(room, player.id, getGamesById());
            })
        );

        socket.on('session:restart', (payload, ack) =>
            withAck(ack, () => {
                const { room, player } = authenticate(payload);
                requireAdmin(room, player);
                room.phase = PHASES.LOBBY;
                room.shownGameIds = [];
                room.recommendationHistoryIds = [];
                room.currentGameId = null;
                room.votes = new Map();
                room.playerFeatureStats = new Map();
                room.playerLearningVoteCounts = new Map();
                room.recommendationDecisions = [];
                room.results = [];
                room.reveal = null;
                room.winnerId = null;
                for (const member of room.players.values()) member.preferences = null;
                store.touch(room);
                emitRoom(room);
                return serializeRoom(room, player.id, getGamesById());
            })
        );

        socket.on('disconnect', () => {
            const room = store.disconnectSocket(socket.id);
            if (room) emitRoom(room);
        });
    });
};

module.exports = { registerGameFinderHandlers };
