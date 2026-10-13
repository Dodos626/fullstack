const test = require('node:test');
const assert = require('node:assert/strict');
const { selectNextGame } = require('../modules/gamefinder/gamefinder.engine');
const { scenarios } = require('./fixtures/gamefinder.replay-scenarios');

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

test('synthetic replay scenarios select the expected deterministic candidates', () => {
    const questionnaireScenario = scenarios.find((scenario) => scenario.name === 'questionnaire fit');
    const fairnessScenario = scenarios.find(
        (scenario) => scenario.name === 'broadly acceptable over polarizing'
    );

    assert.equal(selectNextGame(createRoom(questionnaireScenario), questionnaireScenario.games).id, 1);
    assert.equal(selectNextGame(createRoom(fairnessScenario), fairnessScenario.games).id, 11);
});