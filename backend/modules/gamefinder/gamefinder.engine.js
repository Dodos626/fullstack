const { VOTE_VALUES } = require('./gamefinder.constants');

const unique = (values) => [...new Set(values)];
const typedGameFeatures = (game) =>
    unique([
        ...(game.genres || []).map((value) => `genre:${value}`),
        ...(game.tags || []).map((value) => `tag:${value}`),
        ...(game.categories || []).map((value) => `category:${value}`),
        ...(game.platforms || []).map((value) => `platform:${value}`),
    ]);
const gameSignals = (game) => typedGameFeatures(game);
const featureWeight = (feature, featureWeights) => featureWeights.get(feature) || 1;
const normalizedFeatureWeights = (game, featureWeights) => {
    const features = typedGameFeatures(game);
    const normalization = Math.sqrt(Math.max(1, features.length));
    return features.map((feature) => ({
        feature,
        weight: featureWeight(feature, featureWeights) / normalization,
    }));
};

const explicitPlayerScore = (game, preferences, featureWeights) => {
    if (!preferences) return { score: 0, reasons: [] };
    let score = 0;
    const reasons = [];
    const addMatches = (type, values, gameValues, baseWeight, label) => {
        const matches = values.filter((value) => gameValues.includes(value));
        for (const value of matches) {
            score += baseWeight * featureWeight(`${type}:${value}`, featureWeights);
        }
        if (matches.length) reasons.push(`${label} ${matches.slice(0, 2).join(' and ')}`);
    };

    addMatches('genre', preferences.includedGenres, game.genres, 3, 'matches');
    addMatches('category', preferences.includedCategories, game.categories, 2.5, 'supports');
    addMatches('tag', preferences.includedTags, game.tags, 2, 'matches');
    addMatches('platform', preferences.platforms, game.platforms, 0.75, 'runs on');
    return { score, reasons };
};

const learnedPlayerScore = (game, room, playerId, featureWeights) => {
    const affinities = room.playerAffinities?.get(playerId);
    const evidence = room.playerEvidence?.get(playerId);
    if (!affinities || !evidence) return { score: 0, uncertainty: 1 };

    let score = 0;
    let confidence = 0;
    let weightTotal = 0;
    for (const { feature, weight } of normalizedFeatureWeights(game, featureWeights)) {
        const observations = evidence.get(feature) || 0;
        const shrinkage = observations / (observations + 2);
        score += (affinities.get(feature) || 0) * shrinkage * weight;
        confidence += shrinkage * weight;
        weightTotal += weight;
    }
    return {
        score,
        uncertainty: weightTotal ? Math.max(0, 1 - confidence / weightTotal) : 1,
    };
};

const isGameEligible = (game, room) => {
    if (game.platform !== 'steam') return false;
    const recommendationHistoryIds = room.recommendationHistoryIds || room.shownGameIds;
    if (recommendationHistoryIds.includes(game.id)) return false;

    for (const player of room.players.values()) {
        const preferences = player.preferences;
        if (!preferences) continue;
        if (
            preferences.priceFilterEnabled &&
            (game.priceFinalUsd == null ||
                game.priceFinalUsd < preferences.priceMinUsd ||
                game.priceFinalUsd > preferences.priceMaxUsd)
        )
            return false;
        if (
            preferences.ratingFilterEnabled &&
            (game.steamReviewsPercent == null ||
                game.steamReviewsPercent < preferences.minimumRating)
        )
            return false;
        if (
            preferences.ratingCountFilterEnabled &&
            (game.steamReviewsCount == null ||
                game.steamReviewsCount < preferences.minimumRatingCount)
        )
            return false;
        if (preferences.excludedGenres.some((value) => game.genres.includes(value))) return false;
        if (preferences.excludedTags.some((value) => game.tags.includes(value))) return false;
        if (preferences.excludedCategories.some((value) => game.categories.includes(value)))
            return false;
        if (
            preferences.platforms.length &&
            !preferences.platforms.some((value) => game.platforms.includes(value))
        )
            return false;
    }
    return true;
};

const bayesianReviewScore = (game) => {
    if (game.steamReviewsPercent == null || game.steamReviewsCount == null) return 0.5;
    const confidenceThreshold = 500;
    const catalogPrior = 0.7;
    const rating = game.steamReviewsPercent / 100;
    return (
        (game.steamReviewsCount * rating + confidenceThreshold * catalogPrior) /
        (game.steamReviewsCount + confidenceThreshold)
    );
};

const scoreGame = (game, room, featureWeights = new Map()) => {
    const playerScores = [];
    const reasons = [];
    let uncertainty = 0;
    const completedRounds = room.shownGameIds.length;
    const hasLearnedEvidence = [...(room.playerEvidence?.values() || [])].some(
        (evidence) => evidence.size > 0
    );
    const learnedBlend = hasLearnedEvidence
        ? Math.max(0.2, Math.min(0.65, completedRounds / Math.max(1, room.maxGames || 8)))
        : 0;

    for (const [playerId, player] of room.players.entries()) {
        const explicit = explicitPlayerScore(game, player.preferences, featureWeights);
        const learned = learnedPlayerScore(game, room, playerId, featureWeights);
        const playerScore = explicit.score * (1 - learnedBlend) + learned.score * learnedBlend;
        playerScores.push(playerScore);
        uncertainty += learned.uncertainty;
        reasons.push(...explicit.reasons);
    }

    const mean = playerScores.length
        ? playerScores.reduce((sum, value) => sum + value, 0) / playerScores.length
        : 0;
    const minimum = playerScores.length ? Math.min(...playerScores) : 0;
    const variance = playerScores.length
        ? playerScores.reduce((sum, value) => sum + (value - mean) ** 2, 0) / playerScores.length
        : 0;
    const disagreement = Math.sqrt(variance);
    const groupUtility = mean * 0.55 + minimum * 0.3 - disagreement * 0.15;
    const qualityScore = bayesianReviewScore(game) * 2;
    const explorationWeight = Math.max(0, 1 - completedRounds / Math.max(1, room.maxGames || 8));
    const explorationBonus =
        (uncertainty / Math.max(1, playerScores.length)) * explorationWeight * 1.5;

    return {
        game,
        score: groupUtility + qualityScore + explorationBonus,
        playerScores,
        meanPlayerScore: mean,
        minimumPlayerScore: minimum,
        disagreement,
        groupUtility,
        qualityScore,
        explorationBonus,
        uncertainty: uncertainty / Math.max(1, playerScores.length),
        preferenceScore: mean,
        conflicts: 0,
        reasons: unique(reasons).slice(0, 5),
    };
};

const selectNextGame = (room, catalog, featureWeights = new Map()) => {
    const eligible = catalog.filter((game) => isGameEligible(game, room));
    const poolSize = Math.min(700, eligible.length);
    const sampled = [];
    for (let index = 0; index < eligible.length; index += 1) {
        const game = eligible[index];
        if (index < poolSize) sampled.push(game);
        else {
            const replacementIndex = Math.floor(Math.random() * (index + 1));
            if (replacementIndex < poolSize) sampled[replacementIndex] = game;
        }
    }

    const preferred = eligible
        .map((game) => ({
            game,
            score: [...room.players.values()].reduce(
                (sum, player) =>
                    sum + explicitPlayerScore(game, player.preferences, featureWeights).score,
                0
            ),
        }))
        .filter((candidate) => candidate.score > 0)
        .sort((a, b) => b.score - a.score || a.game.id - b.game.id)
        .slice(0, 300)
        .map((candidate) => candidate.game);
    const candidates = [
        ...new Map([...sampled, ...preferred].map((game) => [game.id, game])).values(),
    ].map((game) => scoreGame(game, room, featureWeights));
    const recentGames = room.shownGameIds
        .slice(-3)
        .map((gameId) => catalog.find((game) => game.id === gameId))
        .filter(Boolean);

    for (const candidate of candidates) {
        const candidateFeatures = new Set(typedGameFeatures(candidate.game));
        const maximumSimilarity = recentGames.reduce((maximum, previousGame) => {
            const previousFeatures = typedGameFeatures(previousGame);
            const overlap = previousFeatures.filter((feature) =>
                candidateFeatures.has(feature)
            ).length;
            const union = new Set([...previousFeatures, ...candidateFeatures]).size;
            return Math.max(maximum, union ? overlap / union : 0);
        }, 0);
        candidate.diversityPenalty = maximumSimilarity * 2;
        candidate.score -= candidate.diversityPenalty;
        candidate.score += Math.random() * Math.max(0.001, candidate.explorationBonus) * 0.25;
    }

    for (let index = candidates.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
    }

    candidates.sort((a, b) => b.score - a.score || b.minimumPlayerScore - a.minimumPlayerScore);
    return candidates[0]?.game || null;
};

const summarizeVotes = (room, gameId) => {
    const votes = room.votes.get(gameId) || new Map();
    const summary = { like: 0, maybe: 0, skipped: 0, dislike: 0, total: 0, score: 0 };
    for (const vote of votes.values()) {
        summary[vote] += 1;
        summary.total += 1;
        summary.score += VOTE_VALUES[vote];
    }
    return summary;
};

const applyVoteLearning = (room, game, featureWeights = new Map()) => {
    const summary = summarizeVotes(room, game.id);
    const voteWeights = { like: 1, maybe: 0.25, dislike: -1.25, skipped: 0 };
    if (!room.playerAffinities) room.playerAffinities = new Map();
    if (!room.playerEvidence) room.playerEvidence = new Map();

    for (const [playerId, vote] of (room.votes.get(game.id) || new Map()).entries()) {
        if (vote === 'skipped') continue;
        const affinities = room.playerAffinities.get(playerId) || new Map();
        const evidence = room.playerEvidence.get(playerId) || new Map();
        for (const { feature, weight } of normalizedFeatureWeights(game, featureWeights)) {
            affinities.set(feature, (affinities.get(feature) || 0) + voteWeights[vote] * weight);
            evidence.set(feature, (evidence.get(feature) || 0) + 1);
        }
        room.playerAffinities.set(playerId, affinities);
        room.playerEvidence.set(playerId, evidence);
    }
    return summary;
};

const createResult = (room, game, featureWeights = new Map()) => {
    const voteSummary = summarizeVotes(room, game.id);
    const scored = scoreGame(game, room, featureWeights);
    const voteValues = { like: 1, maybe: 0.55, skipped: 0.5, dislike: 0 };
    const playerVotes = [...room.players.keys()].map(
        (playerId) => voteValues[(room.votes.get(game.id) || new Map()).get(playerId)] ?? 0.5
    );
    const meanVote = playerVotes.length
        ? playerVotes.reduce((sum, value) => sum + value, 0) / playerVotes.length
        : 0;
    const minimumVote = playerVotes.length ? Math.min(...playerVotes) : 0;
    const normalizedPreference = Math.max(0, Math.min(1, (scored.meanPlayerScore + 5) / 15));
    const finalScore =
        meanVote * 50 +
        minimumVote * 20 +
        normalizedPreference * 20 +
        bayesianReviewScore(game) * 10;
    const strengths = [];
    const tradeoffs = [];

    if (voteSummary.like === room.players.size) strengths.push('Every player voted Like.');
    else if (voteSummary.dislike === 0) strengths.push('No player voted Dislike.');
    if (voteSummary.like)
        strengths.push(`${voteSummary.like}/${room.players.size} players voted Like.`);
    if (scored.reasons.length)
        strengths.push(`Questionnaire fit: ${scored.reasons.slice(0, 2).join('; ')}.`);
    if (scored.minimumPlayerScore >= 0)
        strengths.push('Its weakest individual preference match stayed non-negative.');
    if (voteSummary.dislike)
        tradeoffs.push(`${voteSummary.dislike}/${room.players.size} players voted Dislike.`);
    if (scored.disagreement > 2)
        tradeoffs.push('Player preference scores were relatively divided.');
    if (game.steamReviewsPercent == null) tradeoffs.push('Steam rating confidence is unavailable.');

    return {
        game,
        voteSummary,
        preferenceScore: scored.meanPlayerScore,
        conflicts: voteSummary.dislike,
        finalScore,
        compatibility: Math.round(Math.max(0, Math.min(100, finalScore))),
        reasons: strengths.slice(0, 5),
        explanation: {
            headline: 'Strong group fit',
            strengths: strengths.slice(0, 4),
            tradeoffs: tradeoffs.slice(0, 3),
            comparison: '',
        },
        scoreBreakdown: {
            voteScore: Math.round(meanVote * 100),
            weakestPlayerVote: Math.round(minimumVote * 100),
            preferenceScore: Math.round(normalizedPreference * 100),
            qualityScore: Math.round(bayesianReviewScore(game) * 100),
        },
    };
};

const compareTopResults = (first, second) => {
    if (!second) return 'It is the only completed result in this queue.';
    if (first.voteSummary.dislike !== second.voteSummary.dislike)
        return `It ranks above #2 because it has fewer Dislikes (${first.voteSummary.dislike} vs ${second.voteSummary.dislike}).`;
    if (first.voteSummary.like !== second.voteSummary.like)
        return `It ranks above #2 because it has more Likes (${first.voteSummary.like} vs ${second.voteSummary.like}).`;
    if (first.scoreBreakdown.weakestPlayerVote !== second.scoreBreakdown.weakestPlayerVote)
        return `It ranks above #2 because its weakest player vote is stronger (${first.scoreBreakdown.weakestPlayerVote} vs ${second.scoreBreakdown.weakestPlayerVote}).`;
    if (first.scoreBreakdown.preferenceScore !== second.scoreBreakdown.preferenceScore)
        return `Votes were close, so its stronger questionnaire fit put it first (${first.scoreBreakdown.preferenceScore}% vs ${second.scoreBreakdown.preferenceScore}%).`;
    return `It has the highest combined consensus score (${first.compatibility}% vs ${second.compatibility}%).`;
};

const rankResults = (room, gamesById, featureWeights = new Map()) => {
    const results = room.shownGameIds
        .map((gameId) => createResult(room, gamesById.get(gameId), featureWeights))
        .filter((result) => result.game);
    results.sort(
        (a, b) =>
            a.voteSummary.dislike - b.voteSummary.dislike ||
            b.voteSummary.like - a.voteSummary.like ||
            b.finalScore - a.finalScore ||
            a.game.id - b.game.id
    );
    const topResults = results.slice(0, 3);
    if (topResults[0]) {
        topResults[0].explanation.headline = 'Best overall group fit';
        topResults[0].explanation.comparison = compareTopResults(topResults[0], topResults[1]);
    }
    if (topResults[1]) {
        topResults[1].explanation.headline = 'Runner-up';
        topResults[1].explanation.comparison =
            'It finished behind #1 on consensus, weakest-player support, or questionnaire fit.';
    }
    if (topResults[2]) {
        topResults[2].explanation.headline = 'Third choice';
        topResults[2].explanation.comparison =
            'It remains a strong option, but the top two produced better group consensus.';
    }
    return topResults;
};

module.exports = {
    applyVoteLearning,
    bayesianReviewScore,
    gameSignals,
    isGameEligible,
    rankResults,
    scoreGame,
    selectNextGame,
    summarizeVotes,
    typedGameFeatures,
};
