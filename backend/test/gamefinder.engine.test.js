const test = require('node:test');
const assert = require('node:assert/strict');
const {
    applyVoteLearning,
    isGameEligible,
    learnedPlayerScore,
    questionnairePlayerScore,
    rankResults,
    scoreGame,
    selectNextGame,
    typedGameFeatures,
} = require('../modules/gamefinder/gamefinder.engine');
const {
    recommendationFeatureVector,
    weightedJaccardSimilarity,
} = require('../modules/gamefinder/gamefinder.features');

const game = (overrides = {}) => ({
    id: 1,
    platform: 'steam',
    name: 'Game',
    priceFinalUsd: null,
    genres: ['action'],
    tags: ['zombies'],
    categories: ['online-co-op'],
    platforms: ['win'],
    steamReviewsPercent: 90,
    steamReviewsCount: 1000,
    ...overrides,
});
const preferences = (overrides = {}) => ({
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
    ...overrides,
});
const room = (...values) => ({
    players: new Map(values.map((value, index) => [`p${index}`, { preferences: value }])),
    shownGameIds: [],
    recommendationHistoryIds: [],
    votes: new Map(),
    playerFeatureStats: new Map(),
    playerLearningVoteCounts: new Map(),
    recommendationDecisions: [],
    maxGames: 8,
});
const featureStat = (signedEvidence, evidence) => ({
    signedEvidence,
    evidence,
    lastUpdatedRound: 1,
});

test('unknown prices remain eligible unless price filtering is enabled', () => {
    assert.equal(isGameEligible(game(), room(preferences())), true);
    assert.equal(isGameEligible(game(), room(preferences({ priceFilterEnabled: true }))), false);
});

test('excluded facets and required platforms remain hard filters', () => {
    assert.equal(isGameEligible(game(), room(preferences({ excludedTags: ['zombies'] }))), false);
    assert.equal(isGameEligible(game(), room(preferences({ platforms: ['lnx'] }))), false);
});

test('optional rating and review-count requirements remain hard filters', () => {
    assert.equal(
        isGameEligible(
            game({ steamReviewsPercent: 79 }),
            room(preferences({ ratingFilterEnabled: true, minimumRating: 80 }))
        ),
        false
    );
    assert.equal(
        isGameEligible(
            game({ steamReviewsCount: 99 }),
            room(preferences({ ratingCountFilterEnabled: true, minimumRatingCount: 100 }))
        ),
        false
    );
});

test('questionnaire compatibility is normalized to zero through one', () => {
    const wanted = preferences({ includedGenres: ['action'], includedTags: ['zombies', 'co-op'] });
    assert.equal(questionnairePlayerScore(game({ tags: ['zombies', 'co-op'] }), wanted).score, 1);
    assert.equal(questionnairePlayerScore(game({ genres: ['strategy'], tags: [] }), wanted).score, 0);
    assert.equal(questionnairePlayerScore(game(), preferences()).score, 0.5);
});

test('source-backed questionnaire matching influences deterministic selection', () => {
    const currentRoom = room(preferences({ includedTags: ['zombies'] }));
    const catalog = [game({ id: 2, tags: [] }), game()];
    assert.equal(selectNextGame(currentRoom, catalog).id, 1);
    assert.equal(selectNextGame(room(preferences({ includedTags: ['zombies'] })), catalog).id, 1);
});

test('categories, platforms, and disabled facets do not enter learned features', () => {
    const currentRoom = room(preferences());
    const source = game({
        genres: ['action', 'modern'],
        tags: ['action', 'zombies', 'utilities'],
        categories: ['online-co-op'],
        platforms: ['win'],
    });
    assert.deepEqual(typedGameFeatures(source), ['genre:action', 'tag:zombies']);

    currentRoom.votes.set(source.id, new Map([['p0', 'like']]));
    applyVoteLearning(currentRoom, source);
    const stats = currentRoom.playerFeatureStats.get('p0');
    assert.equal(stats.has('genre:modern'), false);
    assert.equal(stats.has('tag:utilities'), false);
    assert.equal([...stats.keys()].some((feature) => feature.startsWith('category:')), false);
    assert.equal([...stats.keys()].some((feature) => feature.startsWith('platform:')), false);
});

test('feature contribution is bounded regardless of metadata count', () => {
    const compact = recommendationFeatureVector(game({ genres: ['action'], tags: ['zombies'] }));
    const verbose = recommendationFeatureVector(
        game({ genres: ['action', 'adventure'], tags: ['zombies', 'co-op', 'survival', 'horror'] })
    );
    assert.ok(Math.abs(compact.reduce((sum, value) => sum + value.weight, 0) - 1) < 1e-9);
    assert.ok(Math.abs(verbose.reduce((sum, value) => sum + value.weight, 0) - 1) < 1e-9);
});

test('vote learning tracks signed evidence separately from evidence strength', () => {
    const currentRoom = room(preferences(), preferences(), preferences());
    const source = game();
    currentRoom.votes.set(
        source.id,
        new Map([
            ['p0', 'like'],
            ['p1', 'maybe'],
            ['p2', 'dislike'],
        ])
    );
    applyVoteLearning(currentRoom, source);
    const liked = currentRoom.playerFeatureStats.get('p0').get('tag:zombies');
    const maybe = currentRoom.playerFeatureStats.get('p1').get('tag:zombies');
    const disliked = currentRoom.playerFeatureStats.get('p2').get('tag:zombies');
    assert.ok(liked.signedEvidence > maybe.signedEvidence);
    assert.ok(maybe.signedEvidence > 0);
    assert.ok(disliked.signedEvidence < 0);
    assert.ok(maybe.evidence < liked.evidence);
    assert.equal(currentRoom.playerLearningVoteCounts.get('p0'), 1);
});

test('a single vote remains smoothed rather than becoming a permanent preference', () => {
    const currentRoom = room(preferences());
    const source = game();
    currentRoom.votes.set(source.id, new Map([['p0', 'like']]));
    applyVoteLearning(currentRoom, source);
    const learned = learnedPlayerScore(source, currentRoom, 'p0');
    assert.ok(learned.score > 0.5);
    assert.ok(learned.score < 0.65);
    assert.ok(learned.confidence < 0.3);
});

test('group disagreement and weakest-player utility lower candidate score', () => {
    const consensusRoom = room(preferences(), preferences(), preferences(), preferences());
    const dividedRoom = room(preferences(), preferences(), preferences(), preferences());
    for (const currentRoom of [consensusRoom, dividedRoom]) {
        currentRoom.playerLearningVoteCounts = new Map([
            ['p0', 4],
            ['p1', 4],
            ['p2', 4],
            ['p3', 4],
        ]);
    }
    consensusRoom.playerFeatureStats = new Map(
        ['p0', 'p1', 'p2', 'p3'].map((id) => [id, new Map([['tag:zombies', featureStat(4, 4)]])])
    );
    dividedRoom.playerFeatureStats = new Map([
        ['p0', new Map([['tag:zombies', featureStat(4, 4)]])],
        ['p1', new Map([['tag:zombies', featureStat(4, 4)]])],
        ['p2', new Map([['tag:zombies', featureStat(4, 4)]])],
        ['p3', new Map([['tag:zombies', featureStat(-4, 4)]])],
    ]);
    const consensus = scoreGame(game(), consensusRoom);
    const divided = scoreGame(game(), dividedRoom);
    assert.ok(consensus.score > divided.score);
    assert.ok(consensus.minimumPlayerScore > divided.minimumPlayerScore);
    assert.ok(consensus.disagreement < divided.disagreement);
});

test('exploration is uncertainty-aware, relevant, and decays with rounds', () => {
    const early = room(preferences({ includedTags: ['zombies'] }));
    const late = room(preferences({ includedTags: ['zombies'] }));
    late.shownGameIds = [10, 11, 12, 13, 14, 15, 16];
    const relevant = scoreGame(game({ tags: ['zombies'] }), early);
    const unrelated = scoreGame(game({ tags: ['co-op'] }), early);
    const lateRelevant = scoreGame(game({ tags: ['zombies'] }), late);
    assert.ok(relevant.explorationBonus > unrelated.explorationBonus);
    assert.ok(relevant.explorationBonus > lateRelevant.explorationBonus);
});

test('weighted diversity ignores platforms and penalizes close recent games', () => {
    const first = game({ genres: ['action'], tags: ['zombies'], platforms: ['win'] });
    const close = game({ id: 2, genres: ['action'], tags: ['zombies'], platforms: ['linux'] });
    const distant = game({ id: 3, genres: ['strategy'], tags: ['card-game'], platforms: ['win'] });
    assert.equal(weightedJaccardSimilarity(first, close), 1);
    assert.equal(weightedJaccardSimilarity(first, distant), 0);
});

test('selection records deterministic decision diagnostics', () => {
    const currentRoom = room(preferences());
    const catalog = [game({ id: 2 }), game({ id: 1 })];
    assert.equal(selectNextGame(currentRoom, catalog).id, 1);
    assert.equal(currentRoom.recommendationDecisions.length, 1);
    assert.equal(currentRoom.recommendationDecisions[0].algorithmVersion, 'evidence-v2');
});

test('final ranking uses questionnaire-only compatibility and preserves dislike-first ordering', () => {
    const currentRoom = room(
        preferences({ includedTags: ['zombies'] }),
        preferences({ includedTags: ['zombies'] })
    );
    currentRoom.shownGameIds = [1, 2];
    currentRoom.votes = new Map([
        [1, new Map([['p0', 'like'], ['p1', 'dislike']])],
        [2, new Map([['p0', 'maybe'], ['p1', 'maybe']])],
    ]);
    currentRoom.playerFeatureStats.set('p0', new Map([['tag:zombies', featureStat(-10, 10)]]));
    currentRoom.playerLearningVoteCounts.set('p0', 10);
    const gamesById = new Map([
        [1, game({ id: 1, tags: ['zombies'] })],
        [2, game({ id: 2, tags: ['co-op'] })],
    ]);
    const results = rankResults(currentRoom, gamesById);
    assert.equal(results[0].game.id, 2);
    assert.equal(results.find((result) => result.game.id === 1).scoreBreakdown.preferenceScore, 100);
});