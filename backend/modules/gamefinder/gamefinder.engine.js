const { GAMEFINDER_ALGORITHM_CONFIG: CONFIG } = require('./gamefinder.algorithm-config');
const {
    featureWeight,
    recommendationFeatureVector,
    recommendationFeatures,
    weightedJaccardSimilarity,
} = require('./gamefinder.features');
const { VOTE_VALUES } = require('./gamefinder.constants');
const { filterRecommendationValues } = require('./gamefinder.facet-policy');

const clamp = (value, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, value));
const unique = (values) => [...new Set(values)];
const mean = (values, fallback = 0) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;

const typedGameFeatures = (game) => {
    const features = recommendationFeatures(game);
    return [...features.genre, ...features.tag];
};
const gameSignals = (game) => typedGameFeatures(game);

const questionnairePlayerScore = (game, preferences, featureWeights = new Map()) => {
    if (!preferences) return { score: 0.5, reasons: [] };
    const selectedGenres = unique(
        filterRecommendationValues('genre', preferences.includedGenres)
    );
    const selectedGenreNames = new Set(selectedGenres);
    const selected = {
        genre: selectedGenres,
        tag: unique(filterRecommendationValues('tag', preferences.includedTags)).filter(
            (tag) => !selectedGenreNames.has(tag)
        ),
    };
    const gameValues = {
        genre: new Set(filterRecommendationValues('genre', game.genres)),
        tag: new Set(filterRecommendationValues('tag', game.tags)),
    };
    const activeTypes = Object.keys(selected).filter((type) => selected[type].length);
    if (!activeTypes.length) return { score: 0.5, reasons: [] };

    const reasons = [];
    let score = 0;
    let budgetTotal = 0;
    for (const type of activeTypes) {
        const values = selected[type];
        const totalWeight = values.reduce(
            (sum, value) => sum + featureWeight(`${type}:${value}`, featureWeights),
            0
        );
        const matches = values.filter((value) => gameValues[type].has(value));
        const matchedWeight = matches.reduce(
            (sum, value) => sum + featureWeight(`${type}:${value}`, featureWeights),
            0
        );
        const budget = CONFIG.featureBudgets[type];
        score += (totalWeight ? matchedWeight / totalWeight : 0) * budget;
        budgetTotal += budget;
        if (matches.length) reasons.push(`matches ${matches.slice(0, 2).join(' and ')}`);
    }
    return { score: budgetTotal ? score / budgetTotal : 0.5, reasons };
};

const explicitPlayerScore = questionnairePlayerScore;

const learnedPlayerScore = (game, room, playerId, featureWeights = new Map()) => {
    const stats = room.playerFeatureStats?.get(playerId) || new Map();
    const vector = recommendationFeatureVector(game, featureWeights);
    if (!vector.length) return { score: 0.5, confidence: 0, uncertainty: 1 };

    let direction = 0;
    let confidence = 0;
    for (const { feature, weight } of vector) {
        const stat = stats.get(feature) || { signedEvidence: 0, evidence: 0 };
        const affinity = stat.signedEvidence / (CONFIG.evidenceSmoothing + stat.evidence);
        const featureConfidence = stat.evidence / (CONFIG.evidenceSmoothing + stat.evidence);
        direction += clamp(affinity, -1, 1) * weight;
        confidence += featureConfidence * weight;
    }
    return {
        score: clamp(0.5 + direction * 0.5),
        confidence: clamp(confidence),
        uncertainty: clamp(1 - confidence),
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
        if (
            filterRecommendationValues('genre', preferences.excludedGenres).some((value) =>
                filterRecommendationValues('genre', game.genres).includes(value)
            )
        )
            return false;
        if (
            filterRecommendationValues('tag', preferences.excludedTags).some((value) =>
                filterRecommendationValues('tag', game.tags).includes(value)
            )
        )
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

const questionnaireGroupScore = (game, room, featureWeights = new Map()) =>
    mean(
        [...room.players.values()].map(
            (player) => questionnairePlayerScore(game, player.preferences, featureWeights).score
        ),
        0.5
    );

const scoreGame = (game, room, featureWeights = new Map()) => {
    const playerScores = [];
    const questionnaireScores = [];
    const reasons = [];
    const uncertainties = [];

    for (const [playerId, player] of room.players.entries()) {
        const questionnaire = questionnairePlayerScore(game, player.preferences, featureWeights);
        const learned = learnedPlayerScore(game, room, playerId, featureWeights);
        const voteCount = room.playerLearningVoteCounts?.get(playerId) || 0;
        const baseBlend = Math.min(
            CONFIG.maximumLearnedBlend,
            CONFIG.learnedBlendPerVote * voteCount
        );
        const learnedBlend = baseBlend * learned.confidence;
        playerScores.push(
            clamp(questionnaire.score * (1 - learnedBlend) + learned.score * learnedBlend)
        );
        questionnaireScores.push(questionnaire.score);
        uncertainties.push(learned.uncertainty);
        reasons.push(...questionnaire.reasons);
    }

    const meanPlayerScore = mean(playerScores, 0.5);
    const minimumPlayerScore = playerScores.length ? Math.min(...playerScores) : 0.5;
    const disagreement = Math.sqrt(
        mean(playerScores.map((value) => (value - meanPlayerScore) ** 2), 0)
    );
    const groupUtility =
        meanPlayerScore * CONFIG.groupUtilityWeights.mean +
        minimumPlayerScore * CONFIG.groupUtilityWeights.minimum -
        disagreement * CONFIG.groupUtilityWeights.disagreement;
    const uncertainty = mean(uncertainties, 1);
    const questionnaireScore = mean(questionnaireScores, 0.5);
    const relevance =
        CONFIG.exploration.relevanceFloor +
        (1 - CONFIG.exploration.relevanceFloor) * questionnaireScore;
    const schedule = clamp(1 - room.shownGameIds.length / Math.max(1, room.maxGames || 8));
    const explorationBonus =
        CONFIG.exploration.initialWeight * schedule * uncertainty * relevance;

    return {
        game,
        score: groupUtility + explorationBonus,
        playerScores,
        questionnaireScores,
        meanPlayerScore,
        minimumPlayerScore,
        disagreement,
        groupUtility,
        qualityScore: bayesianReviewScore(game),
        explorationBonus,
        uncertainty,
        questionnaireScore,
        preferenceScore: meanPlayerScore,
        conflicts: 0,
        reasons: unique(reasons).slice(0, 5),
    };
};

const compareCandidates = (left, right) =>
    right.score - left.score ||
    right.minimumPlayerScore - left.minimumPlayerScore ||
    right.meanPlayerScore - left.meanPlayerScore ||
    right.qualityScore - left.qualityScore ||
    left.game.id - right.game.id;

const selectNextGame = (room, catalog, featureWeights = new Map()) => {
    const recentGames = room.shownGameIds
        .slice(-CONFIG.diversity.recentGameCount)
        .map((gameId) => catalog.find((game) => game.id === gameId))
        .filter(Boolean);
    const candidates = catalog
        .filter((game) => isGameEligible(game, room))
        .map((game) => {
            const candidate = scoreGame(game, room, featureWeights);
            const maximumSimilarity = recentGames.reduce(
                (maximum, previousGame) =>
                    Math.max(
                        maximum,
                        weightedJaccardSimilarity(game, previousGame, featureWeights)
                    ),
                0
            );
            candidate.diversityPenalty = maximumSimilarity * CONFIG.diversity.weight;
            candidate.score -= candidate.diversityPenalty;
            return candidate;
        })
        .sort(compareCandidates);
    const selected = candidates[0];
    if (!selected) return null;

    if (!room.recommendationDecisions) room.recommendationDecisions = [];
    room.recommendationDecisions.push({
        algorithmVersion: CONFIG.version,
        gameId: selected.game.id,
        completedRound: room.shownGameIds.length,
        groupUtility: selected.groupUtility,
        meanUtility: selected.meanPlayerScore,
        minimumUtility: selected.minimumPlayerScore,
        disagreement: selected.disagreement,
        uncertainty: selected.uncertainty,
        explorationBonus: selected.explorationBonus,
        diversityPenalty: selected.diversityPenalty,
        nextScore: selected.score,
    });
    return selected.game;
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
    if (!room.playerFeatureStats) room.playerFeatureStats = new Map();
    if (!room.playerLearningVoteCounts) room.playerLearningVoteCounts = new Map();
    const round = (room.recommendationHistoryIds || room.shownGameIds).length;

    for (const [playerId, vote] of (room.votes.get(game.id) || new Map()).entries()) {
        const signal = CONFIG.learningSignals[vote];
        if (!signal?.evidence) continue;
        const stats = room.playerFeatureStats.get(playerId) || new Map();
        for (const { feature, weight } of recommendationFeatureVector(game, featureWeights)) {
            const current = stats.get(feature) || {
                signedEvidence: 0,
                evidence: 0,
                lastUpdatedRound: 0,
            };
            stats.set(feature, {
                signedEvidence: current.signedEvidence + signal.signed * weight,
                evidence: current.evidence + signal.evidence * weight,
                lastUpdatedRound: round,
            });
        }
        room.playerFeatureStats.set(playerId, stats);
        room.playerLearningVoteCounts.set(
            playerId,
            (room.playerLearningVoteCounts.get(playerId) || 0) + 1
        );
    }
    return summary;
};

const createResult = (room, game, featureWeights = new Map()) => {
    const voteSummary = summarizeVotes(room, game.id);
    const voteValues = { like: 1, maybe: 0.55, skipped: 0.5, dislike: 0 };
    const playerVotes = [...room.players.keys()].map(
        (playerId) => voteValues[(room.votes.get(game.id) || new Map()).get(playerId)] ?? 0.5
    );
    const meanVote = mean(playerVotes, 0);
    const minimumVote = playerVotes.length ? Math.min(...playerVotes) : 0;
    const questionnaireScore = questionnaireGroupScore(game, room, featureWeights);
    const steamQuality = bayesianReviewScore(game);
    const finalScore =
        meanVote * CONFIG.finalResultWeights.meanVote +
        minimumVote * CONFIG.finalResultWeights.minimumVote +
        questionnaireScore * CONFIG.finalResultWeights.questionnaire +
        steamQuality * CONFIG.finalResultWeights.steamQuality;
    const strengths = [];
    const tradeoffs = [];
    const questionnaireReasons = unique(
        [...room.players.values()].flatMap(
            (player) => questionnairePlayerScore(game, player.preferences, featureWeights).reasons
        )
    );

    if (voteSummary.like === room.players.size) strengths.push('Every player voted Like.');
    else if (voteSummary.dislike === 0) strengths.push('No player voted Dislike.');
    if (voteSummary.like)
        strengths.push(`${voteSummary.like}/${room.players.size} players voted Like.`);
    if (questionnaireReasons.length)
        strengths.push(`Questionnaire fit: ${questionnaireReasons.slice(0, 2).join('; ')}.`);
    if (voteSummary.dislike)
        tradeoffs.push(`${voteSummary.dislike}/${room.players.size} players voted Dislike.`);
    if (game.steamReviewsPercent == null) tradeoffs.push('Steam rating confidence is unavailable.');

    return {
        game,
        voteSummary,
        preferenceScore: questionnaireScore,
        conflicts: voteSummary.dislike,
        finalScore,
        compatibility: Math.round(clamp(finalScore) * 100),
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
            preferenceScore: Math.round(questionnaireScore * 100),
            qualityScore: Math.round(steamQuality * 100),
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
    explicitPlayerScore,
    gameSignals,
    isGameEligible,
    learnedPlayerScore,
    questionnaireGroupScore,
    questionnairePlayerScore,
    rankResults,
    scoreGame,
    selectNextGame,
    summarizeVotes,
    typedGameFeatures,
};