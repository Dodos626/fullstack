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

const game = (id, overrides = {}) => ({
    id,
    platform: 'steam',
    name: `Synthetic Game ${id}`,
    priceFinalUsd: 1000,
    genres: [],
    tags: [],
    categories: ['multi-player'],
    platforms: ['win'],
    steamReviewsPercent: 80,
    steamReviewsCount: 1000,
    ...overrides,
});

const scenarios = [
    {
        name: 'questionnaire fit',
        players: [
            preferences({ includedTags: ['co-op'] }),
            preferences({ includedTags: ['co-op'] }),
        ],
        games: [
            game(1, { tags: ['co-op'] }),
            game(2, { tags: ['pvp'] }),
            game(3, { tags: ['co-op', 'survival'] }),
        ],
        hiddenUtility: new Map([
            [1, 0.8],
            [2, 0.2],
            [3, 0.9],
        ]),
    },
    {
        name: 'broadly acceptable over polarizing',
        players: [preferences(), preferences(), preferences(), preferences()],
        games: [game(10, { tags: ['zombies'] }), game(11, { tags: ['co-op'] })],
        hiddenUtility: new Map([
            [10, 0.55],
            [11, 0.75],
        ]),
        featureStats: new Map([
            [
                'p0',
                new Map([
                    ['tag:zombies', { signedEvidence: 4, evidence: 4, lastUpdatedRound: 4 }],
                    ['tag:co-op', { signedEvidence: 2, evidence: 4, lastUpdatedRound: 4 }],
                ]),
            ],
            [
                'p1',
                new Map([
                    ['tag:zombies', { signedEvidence: 4, evidence: 4, lastUpdatedRound: 4 }],
                    ['tag:co-op', { signedEvidence: 2, evidence: 4, lastUpdatedRound: 4 }],
                ]),
            ],
            [
                'p2',
                new Map([
                    ['tag:zombies', { signedEvidence: 4, evidence: 4, lastUpdatedRound: 4 }],
                    ['tag:co-op', { signedEvidence: 2, evidence: 4, lastUpdatedRound: 4 }],
                ]),
            ],
            [
                'p3',
                new Map([
                    ['tag:zombies', { signedEvidence: -4, evidence: 4, lastUpdatedRound: 4 }],
                    ['tag:co-op', { signedEvidence: 2, evidence: 4, lastUpdatedRound: 4 }],
                ]),
            ],
        ]),
        learningVoteCounts: new Map([
            ['p0', 4],
            ['p1', 4],
            ['p2', 4],
            ['p3', 4],
        ]),
    },
];

module.exports = { game, preferences, scenarios };
