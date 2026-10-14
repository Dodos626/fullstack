const test = require('node:test');
const assert = require('node:assert/strict');
const { serializeRoom } = require('../modules/gamefinder/gamefinder.serializer');

const gamesById = new Map([
    [
        548430,
        {
            id: 548430,
            name: 'Deep Rock Galactic',
            description: 'Co-op mining.',
            image: 'https://example.com/deep-rock.jpg',
            steamUrl: 'https://store.steampowered.com/app/548430',
            priceFinalUsd: 2999,
            genres: ['action'],
            tags: ['co-op'],
            platforms: ['win'],
            steamReviewsPercent: 92,
            steamReviewsCount: 304,
            steamReviewsLabel: 'Very Positive',
        },
    ],
]);

test('room serialization hides private preferences and unrevealed vote choices', () => {
    const room = {
        code: 'ABC123',
        phase: 'voting',
        maxGames: 8,
        adminId: 'one',
        shownGameIds: [548430],
        currentGameId: 548430,
        votes: new Map([[548430, new Map([['one', 'like']])]]),
        results: [],
        reveal: null,
        winnerId: null,
        players: new Map([
            [
                'one',
                {
                    id: 'one',
                    displayName: 'Theo',
                    isAdmin: true,
                    connected: true,
                    preferences: {
                        includedGenres: ['action'],
                        excludedGenres: ['fps'],
                        includedTags: ['co-op'],
                        excludedTags: [],
                        platforms: ['win'],
                        priceFilterEnabled: true,
                        priceMinUsd: 0,
                        priceMaxUsd: 1000,
                        ratingFilterEnabled: true,
                        minimumRating: 80,
                        ratingCountFilterEnabled: true,
                        minimumRatingCount: 1000,
                    },
                },
            ],
            [
                'two',
                {
                    id: 'two',
                    displayName: 'Alex',
                    isAdmin: false,
                    connected: true,
                    preferences: {
                        includedGenres: ['action'],
                        excludedGenres: [],
                        includedTags: [],
                        excludedTags: [],
                        platforms: ['win'],
                        priceFilterEnabled: false,
                        priceMinUsd: 0,
                        priceMaxUsd: 10000,
                        ratingFilterEnabled: false,
                        minimumRating: 0,
                        ratingCountFilterEnabled: false,
                        minimumRatingCount: 0,
                    },
                },
            ],
        ]),
    };

    const serialized = serializeRoom(room, 'two', gamesById);

    assert.equal(serialized.voteCount, 1);
    assert.equal(serialized.pendingVoteCount, 1);
    assert.equal(serialized.hasVoted, false);
    assert.equal(serialized.players[0].preferences, undefined);
    assert.equal(serialized.players[0].priceMaxUsd, undefined);
    assert.deepEqual(serialized.preferenceSummary.includedGenres, [{ value: 'action', count: 2 }]);
    assert.equal(serialized.preferenceSummary.includedCategories, undefined);
    assert.deepEqual(serialized.preferenceSummary.platforms, [{ value: 'win', count: 2 }]);
    assert.deepEqual(serialized.preferenceSummary.priceRanges, [
        { minimum: 0, maximum: 1000, count: 1 },
    ]);
    assert.deepEqual(serialized.preferenceSummary.minimumRatings, [{ minimum: 80, count: 1 }]);
    assert.deepEqual(serialized.preferenceSummary.minimumRatingCounts, [
        { minimum: 1000, count: 1 },
    ]);
    assert.equal(serialized.voteChoice, undefined);
    assert.equal(
        serialized.players.some((player) => player.vote === 'like'),
        false
    );
    assert.equal(serialized.currentGame.id, 548430);
    assert.ok(Array.isArray(serialized.currentGame.genres));
    assert.ok(Array.isArray(serialized.currentGame.tags));
    assert.equal(serialized.currentGame.developers, undefined);
    assert.equal(serialized.currentGame.steamRecentPercent, undefined);
    assert.equal(serialized.currentGame.steamReviewsPercent, 92);
    assert.equal(serialized.currentGame.steamReviewsCount, 304);
});

test('result serialization exposes only the viewing player matching choices', () => {
    const game = gamesById.get(548430);
    const room = {
        code: 'ABC123',
        phase: 'results',
        maxGames: 4,
        adminId: 'one',
        shownGameIds: [548430],
        currentGameId: null,
        votes: new Map([
            [
                548430,
                new Map([
                    ['one', 'like'],
                    ['two', 'maybe'],
                ]),
            ],
        ]),
        results: [
            {
                game,
                voteSummary: { like: 1, maybe: 1, skipped: 0, dislike: 0 },
                compatibility: 80,
            },
        ],
        resultStatistics: { gamesReviewed: 1 },
        reveal: null,
        winnerId: null,
        players: new Map([
            [
                'one',
                {
                    id: 'one',
                    displayName: 'Theo',
                    isAdmin: true,
                    connected: true,
                    preferences: {
                        includedGenres: ['action'],
                        includedTags: ['co-op'],
                        platforms: ['win'],
                    },
                },
            ],
            [
                'two',
                {
                    id: 'two',
                    displayName: 'Alex',
                    isAdmin: false,
                    connected: true,
                    preferences: {
                        includedGenres: ['strategy'],
                        includedTags: ['zombies'],
                        platforms: ['lnx'],
                    },
                },
            ],
        ]),
    };

    const first = serializeRoom(room, 'one', gamesById);
    const second = serializeRoom(room, 'two', gamesById);
    assert.deepEqual(first.results[0].yourMatches, {
        genres: ['action'],
        tags: ['co-op'],
        platforms: ['win'],
    });
    assert.deepEqual(second.results[0].yourMatches, {
        genres: [],
        tags: [],
        platforms: [],
    });
    assert.deepEqual(first.resultStatistics, { gamesReviewed: 1 });
});

test('preference counts remain hidden while questionnaires are being collected', () => {
    const room = {
        code: 'ABC123',
        phase: 'questionnaire',
        maxGames: 8,
        adminId: 'one',
        shownGameIds: [],
        currentGameId: null,
        votes: new Map(),
        results: [],
        reveal: null,
        winnerId: null,
        players: new Map([
            [
                'one',
                {
                    id: 'one',
                    displayName: 'Theo',
                    isAdmin: true,
                    connected: true,
                    preferences: {
                        includedGenres: ['action'],
                    },
                },
            ],
            [
                'two',
                {
                    id: 'two',
                    displayName: 'Alex',
                    isAdmin: false,
                    connected: true,
                    preferences: null,
                },
            ],
        ]),
    };

    assert.equal(serializeRoom(room, 'one', gamesById).preferenceSummary, null);
});
