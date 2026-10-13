const publicGame = (game) => {
    if (!game) return null;
    return {
        id: game.id,
        name: game.name,
        description: game.description,
        image: game.image,
        steamUrl: game.steamUrl,
        priceFinalUsd: game.priceFinalUsd,
        genres: game.genres,
        tags: game.tags,
    };
};

const serializeResult = (result) => ({
    ...result,
    game: publicGame(result.game),
});

const PREFERENCE_FIELDS = [
    'includedGenres',
    'excludedGenres',
    'includedTags',
    'excludedTags',
    'includedCategories',
    'excludedCategories',
    'platforms',
];

const countSelections = (players, field) => {
    const counts = new Map();
    for (const player of players) {
        for (const value of new Set(player.preferences?.[field] || [])) {
            counts.set(value, (counts.get(value) || 0) + 1);
        }
    }
    return [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));
};

const summarizePreferences = (room) => {
    const players = [...room.players.values()];
    const summary = Object.fromEntries(
        PREFERENCE_FIELDS.map((field) => [field, countSelections(players, field)])
    );
    const priceRanges = new Map();
    const minimumRatings = new Map();
    const minimumRatingCounts = new Map();

    for (const player of players) {
        const preferences = player.preferences;
        if (!preferences) continue;
        if (preferences.priceFilterEnabled) {
            const key = `${preferences.priceMinUsd}:${preferences.priceMaxUsd}`;
            const current = priceRanges.get(key) || {
                minimum: preferences.priceMinUsd,
                maximum: preferences.priceMaxUsd,
                count: 0,
            };
            current.count += 1;
            priceRanges.set(key, current);
        }
        if (preferences.ratingFilterEnabled) {
            minimumRatings.set(
                preferences.minimumRating,
                (minimumRatings.get(preferences.minimumRating) || 0) + 1
            );
        }
        if (preferences.ratingCountFilterEnabled) {
            minimumRatingCounts.set(
                preferences.minimumRatingCount,
                (minimumRatingCounts.get(preferences.minimumRatingCount) || 0) + 1
            );
        }
    }

    summary.priceRanges = [...priceRanges.values()].sort(
        (left, right) =>
            right.count - left.count || left.minimum - right.minimum || left.maximum - right.maximum
    );
    summary.minimumRatings = [...minimumRatings.entries()]
        .map(([minimum, count]) => ({ minimum, count }))
        .sort((left, right) => right.count - left.count || right.minimum - left.minimum);
    summary.minimumRatingCounts = [...minimumRatingCounts.entries()]
        .map(([minimum, count]) => ({ minimum, count }))
        .sort((left, right) => right.count - left.count || right.minimum - left.minimum);
    return summary;
};

const serializeRoom = (room, viewerId, gamesById) => {
    const viewer = room.players.get(viewerId);
    const currentVoteGameId = room.currentGameId || room.shownGameIds.at(-1);
    const currentVotes = currentVoteGameId ? room.votes.get(currentVoteGameId) : null;

    return {
        code: room.code,
        phase: room.phase,
        maxGames: room.maxGames,
        round: room.shownGameIds.length,
        adminId: room.adminId,
        playerId: viewerId,
        isAdmin: viewerId === room.adminId,
        hasSubmittedPreferences: Boolean(viewer?.preferences),
        playerCount: room.players.size,
        readyCount: [...room.players.values()].filter((player) => player.preferences).length,
        voteCount: currentVotes?.size || 0,
        pendingVoteCount: Math.max(0, room.players.size - (currentVotes?.size || 0)),
        hasVoted: currentVotes?.has(viewerId) || false,
        players: [...room.players.values()].map((player) => ({
            id: player.id,
            displayName: player.displayName,
            isAdmin: player.isAdmin,
            connected: player.connected,
            ready: Boolean(player.preferences),
        })),
        preferenceSummary: ['voting', 'results'].includes(room.phase)
            ? summarizePreferences(room)
            : null,
        currentGame: room.currentGameId ? publicGame(gamesById.get(room.currentGameId)) : null,
        reveal: room.reveal ? serializeResult(room.reveal) : null,
        results: room.results.map(serializeResult),
        winnerId: room.winnerId,
    };
};

module.exports = { publicGame, serializeRoom, summarizePreferences };
