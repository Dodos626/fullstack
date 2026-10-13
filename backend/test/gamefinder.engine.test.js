const test = require('node:test');
const assert = require('node:assert/strict');
const {
    applyVoteLearning,
    isGameEligible,
    selectNextGame,
} = require('../modules/gamefinder/gamefinder.engine');

const game = (overrides = {}) => ({
    id: 1,
    platform: 'steam',
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
    playerAffinities: new Map(),
    playerEvidence: new Map(),
    maxGames: 8,
});

test('unknown prices remain eligible unless price filtering is enabled', () => {
    assert.equal(isGameEligible(game(), room(preferences())), true);
    assert.equal(isGameEligible(game(), room(preferences({ priceFilterEnabled: true }))), false);
});

test('excluded facets and required platforms are hard filters', () => {
    assert.equal(isGameEligible(game(), room(preferences({ excludedTags: ['zombies'] }))), false);
    assert.equal(isGameEligible(game(), room(preferences({ platforms: ['lnx'] }))), false);
});

test('optional rating and review-count requirements are hard filters', () => {
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
    assert.equal(
        isGameEligible(
            game({ steamReviewsPercent: null }),
            room(preferences({ ratingFilterEnabled: false }))
        ),
        true
    );
});

test('source-backed matching influences selection', () => {
    const currentRoom = room(preferences({ includedTags: ['zombies'] }));
    const selected = selectNextGame(currentRoom, [
        game({ id: 2, categories: ['online-pvp'], tags: [] }),
        game(),
    ]);
    assert.equal(selected.id, 1);
});

test('categories and disabled facets do not affect matching or learning', () => {
    const currentRoom = room(
        preferences({
            includedGenres: ['modern'],
            includedTags: ['utilities'],
            excludedTags: ['modern'],
        })
    );
    const source = game({
        genres: ['action', 'modern'],
        tags: ['zombies', 'utilities'],
        categories: ['online-co-op'],
    });

    assert.equal(isGameEligible(source, currentRoom), true);
    const features = require('../modules/gamefinder/gamefinder.engine').typedGameFeatures(source);
    assert.equal(features.includes('genre:modern'), false);
    assert.equal(features.includes('tag:utilities'), false);
    assert.equal(features.some((feature) => feature.startsWith('category:')), false);

    currentRoom.votes.set(source.id, new Map([['p0', 'like']]));
    applyVoteLearning(currentRoom, source);
    assert.equal(currentRoom.playerAffinities.get('p0').has('genre:modern'), false);
    assert.equal(currentRoom.playerAffinities.get('p0').has('tag:utilities'), false);
    assert.equal(currentRoom.playerAffinities.get('p0').has('category:online-co-op'), false);
});

test('categories do not change candidate scores', () => {
    const currentRoom = room(preferences());
    const { scoreGame } = require('../modules/gamefinder/gamefinder.engine');
    const coOpScore = scoreGame(game({ categories: ['online-co-op'] }), currentRoom).score;
    const pvpScore = scoreGame(game({ categories: ['online-pvp'] }), currentRoom).score;
    assert.equal(coOpScore, pvpScore);
});

test('unfiltered selection does not always return the lowest Steam app ID', () => {
    const catalog = Array.from({ length: 600 }, (_, index) =>
        game({ id: index + 1, steamReviewsPercent: 70, steamReviewsCount: 0 })
    );
    const selectedIds = new Set(
        Array.from({ length: 20 }, () => selectNextGame(room(preferences()), catalog).id)
    );
    assert.ok(selectedIds.size > 1);
});

test('revealed votes update shared source-backed signals', () => {
    const currentRoom = room(preferences(), preferences());
    const source = game();
    currentRoom.votes.set(
        source.id,
        new Map([
            ['p0', 'like'],
            ['p1', 'like'],
        ])
    );
    applyVoteLearning(currentRoom, source);
    assert.ok(currentRoom.playerAffinities.get('p0').get('tag:zombies') > 0);
    assert.ok(currentRoom.playerAffinities.get('p1').get('tag:zombies') > 0);
});

test('like and dislike train separate player profiles', () => {
    const currentRoom = room(preferences(), preferences());
    const source = game();
    currentRoom.votes.set(
        source.id,
        new Map([
            ['p0', 'like'],
            ['p1', 'dislike'],
        ])
    );
    applyVoteLearning(currentRoom, source);
    assert.ok(currentRoom.playerAffinities.get('p0').get('tag:zombies') > 0);
    assert.ok(currentRoom.playerAffinities.get('p1').get('tag:zombies') < 0);
});

test('weak-player disagreement lowers a candidate prediction', () => {
    const consensusRoom = room(preferences(), preferences());
    const dividedRoom = room(preferences(), preferences());
    consensusRoom.shownGameIds = [99];
    dividedRoom.shownGameIds = [99];
    consensusRoom.playerAffinities = new Map([
        ['p0', new Map([['tag:zombies', 2]])],
        ['p1', new Map([['tag:zombies', 2]])],
    ]);
    dividedRoom.playerAffinities = new Map([
        ['p0', new Map([['tag:zombies', 2]])],
        ['p1', new Map([['tag:zombies', -2]])],
    ]);
    consensusRoom.playerEvidence = new Map([
        ['p0', new Map([['tag:zombies', 3]])],
        ['p1', new Map([['tag:zombies', 3]])],
    ]);
    dividedRoom.playerEvidence = new Map([
        ['p0', new Map([['tag:zombies', 3]])],
        ['p1', new Map([['tag:zombies', 3]])],
    ]);
    const { scoreGame } = require('../modules/gamefinder/gamefinder.engine');
    assert.ok(
        scoreGame(game({ id: 2 }), consensusRoom).score >
            scoreGame(game({ id: 2 }), dividedRoom).score
    );
});

test('final ranking returns only three explained results', () => {
    const currentRoom = room(preferences(), preferences());
    currentRoom.shownGameIds = [1, 2, 3, 4];
    currentRoom.votes = new Map([
        [
            1,
            new Map([
                ['p0', 'like'],
                ['p1', 'like'],
            ]),
        ],
        [
            2,
            new Map([
                ['p0', 'like'],
                ['p1', 'maybe'],
            ]),
        ],
        [
            3,
            new Map([
                ['p0', 'maybe'],
                ['p1', 'maybe'],
            ]),
        ],
        [
            4,
            new Map([
                ['p0', 'dislike'],
                ['p1', 'like'],
            ]),
        ],
    ]);
    const gamesById = new Map(currentRoom.shownGameIds.map((id) => [id, game({ id })]));
    const { rankResults } = require('../modules/gamefinder/gamefinder.engine');
    const results = rankResults(currentRoom, gamesById);
    assert.equal(results.length, 3);
    assert.equal(results[0].game.id, 1);
    assert.match(results[0].explanation.comparison, /ranks above|highest combined|only completed/i);
});
