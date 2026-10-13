const { performance } = require('node:perf_hooks');
const {
    questionnaireGroupScore,
    scoreGame,
    selectNextGame,
} = require('../modules/gamefinder/gamefinder.engine');
const { scenarios } = require('../test/fixtures/gamefinder.replay-scenarios');

const createRoom = (scenario) => ({
    players: new Map(
        scenario.players.map((preferences, index) => [`p${index}`, { preferences }])
    ),
    shownGameIds: [],
    recommendationHistoryIds: [],
    votes: new Map(),
    playerFeatureStats: scenario.featureStats || new Map(),
    playerLearningVoteCounts: scenario.learningVoteCounts || new Map(),
    recommendationDecisions: [],
    maxGames: 8,
});

const legacyScore = (room, game) => {
    const questionnaire = questionnaireGroupScore(game, room);
    const learnedValues = [...room.players.keys()].map((playerId) => {
        const stats = room.playerFeatureStats.get(playerId) || new Map();
        return (game.tags || []).reduce(
            (sum, tag) => sum + (stats.get(`tag:${tag}`)?.signedEvidence || 0),
            0
        );
    });
    const learnedMean = learnedValues.length
        ? learnedValues.reduce((sum, value) => sum + value, 0) / learnedValues.length
        : 0;
    return questionnaire + learnedMean * 0.1;
};

const legacyQuestionnaireSelection = (room, games) =>
    [...games]
        .map((game) => ({ game, score: legacyScore(room, game) }))
        .sort((left, right) => right.score - left.score || left.game.id - right.game.id)[0].game;

const report = scenarios.map((scenario) => {
    const room = createRoom(scenario);
    const startedAt = performance.now();
    const selected = selectNextGame(room, scenario.games);
    const durationMs = performance.now() - startedAt;
    const legacy = legacyQuestionnaireSelection(createRoom(scenario), scenario.games);
    const scored = scoreGame(selected, room);
    return {
        scenario: scenario.name,
        selected: selected.id,
        legacySelected: legacy.id,
        hiddenUtility: scenario.hiddenUtility.get(selected.id),
        legacyHiddenUtility: scenario.hiddenUtility.get(legacy.id),
        minimumPredictedUtility: Number(scored.minimumPlayerScore.toFixed(3)),
        disagreement: Number(scored.disagreement.toFixed(3)),
        durationMs: Number(durationMs.toFixed(3)),
    };
});

console.table(report);