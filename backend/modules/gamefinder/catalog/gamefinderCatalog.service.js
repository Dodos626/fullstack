const { GameFinderCatalogRepository } = require('./gamefinderCatalog.repository');

const FACET_TYPES = ['genre', 'tag', 'category', 'platform'];

const toRuntimeGame = (value) => {
    const game = value.toJSON ? value.toJSON() : value;
    return {
        ...game,
        id: game.steamAppId,
        platform: 'steam',
    };
};

const emptyOptions = () => ({
    facets: Object.fromEntries(
        FACET_TYPES.map((type) => [`${type}s`, { control: 'choices', options: [] }])
    ),
    price: { minimum: 0, maximum: 10000, step: 500 },
    reviews: { ratingMinimum: 0, ratingMaximum: 100, ratingStep: 5, countMaximum: 0 },
    catalogUpdatedAt: null,
    gameCount: 0,
});

class GameFinderCatalogService {
    constructor(repository = new GameFinderCatalogRepository()) {
        this.repository = repository;
        this.games = [];
        this.gamesById = new Map();
        this.options = emptyOptions();
        this.featureWeights = new Map();
        this.loadedFrom = 'postgres';
    }

    buildOptions(metricRecords, summary = {}) {
        const grouped = Object.fromEntries(FACET_TYPES.map((type) => [type, []]));
        for (const value of metricRecords) {
            const metric = value.toJSON ? value.toJSON() : value;
            if (grouped[metric.type]) {
                grouped[metric.type].push({ name: metric.name, count: metric.count });
            }
        }

        const maximum = Number.isInteger(summary.priceMaximum)
            ? Math.ceil(summary.priceMaximum / 500) * 500
            : 10000;
        return {
            facets: {
                genres: this.facetOptions(grouped.genre),
                tags: this.facetOptions(grouped.tag),
                categories: this.facetOptions(grouped.category),
                platforms: this.facetOptions(grouped.platform),
            },
            price: {
                minimum: Number.isInteger(summary.priceMinimum) ? summary.priceMinimum : 0,
                maximum: Math.max(maximum, 500),
                step: 500,
            },
            reviews: {
                ratingMinimum: 0,
                ratingMaximum: 100,
                ratingStep: 5,
                countMaximum: Number.isInteger(summary.ratingCountMaximum)
                    ? summary.ratingCountMaximum
                    : 0,
            },
            catalogUpdatedAt: summary.catalogUpdatedAt || null,
            gameCount: summary.gameCount || 0,
        };
    }

    facetOptions(options) {
        return { control: options.length > 15 ? 'multi-select' : 'choices', options };
    }

    buildFeatureWeights(metricRecords, gameCount) {
        const typeWeights = { genre: 1.2, category: 1.1, tag: 1, platform: 0.6 };
        return new Map(
            metricRecords.map((value) => {
                const metric = value.toJSON ? value.toJSON() : value;
                const idf = Math.max(
                    0.5,
                    Math.min(3, Math.log((gameCount + 1) / (metric.count + 1)) + 1)
                );
                return [`${metric.type}:${metric.name}`, idf * (typeWeights[metric.type] || 1)];
            })
        );
    }

    async load() {
        const [records, metricRecords, summary] = await Promise.all([
            this.repository.findEnabled(),
            this.repository.findMetrics(),
            this.repository.getCatalogSummary(),
        ]);

        this.games = records.map(toRuntimeGame);
        this.gamesById = new Map(this.games.map((game) => [game.id, game]));
        this.options = this.buildOptions(metricRecords, summary);
        this.featureWeights = this.buildFeatureWeights(metricRecords, summary.gameCount || 0);
        return this.games;
    }

    async refreshOptions() {
        const [metricRecords, summary] = await Promise.all([
            this.repository.findMetrics(),
            this.repository.getCatalogSummary(),
        ]);
        this.options = this.buildOptions(metricRecords, summary);
        this.featureWeights = this.buildFeatureWeights(metricRecords, summary.gameCount || 0);
        return this.options;
    }

    getGames() {
        return this.games;
    }

    getGamesById() {
        return this.gamesById;
    }

    getFeatureWeights() {
        return this.featureWeights;
    }

    getOptions() {
        return { ...this.options, source: this.loadedFrom };
    }

    validatePreferences(preferences) {
        const allowed = Object.fromEntries(
            Object.entries(this.options.facets).map(([name, facet]) => [
                name,
                new Set(facet.options.map((option) => option.name)),
            ])
        );
        const invalid = (values, set) => values.find((value) => !set.has(value));
        const checks = [
            ['includedGenres', 'genres', 'included genre'],
            ['excludedGenres', 'genres', 'excluded genre'],
            ['includedTags', 'tags', 'included tag'],
            ['excludedTags', 'tags', 'excluded tag'],
            ['includedCategories', 'categories', 'included category'],
            ['excludedCategories', 'categories', 'excluded category'],
            ['platforms', 'platforms', 'platform'],
        ];

        for (const [field, facet, label] of checks) {
            if (invalid(preferences[field], allowed[facet])) throw new Error(`Unknown ${label}`);
        }
        if (
            preferences.priceFilterEnabled &&
            (preferences.priceMinUsd < this.options.price.minimum ||
                preferences.priceMaxUsd > this.options.price.maximum)
        ) {
            throw new Error('Price range is outside the current catalog');
        }
        if (
            preferences.ratingFilterEnabled &&
            (preferences.minimumRating < this.options.reviews.ratingMinimum ||
                preferences.minimumRating > this.options.reviews.ratingMaximum)
        ) {
            throw new Error('Minimum rating is outside the valid range');
        }
        if (
            preferences.ratingCountFilterEnabled &&
            (preferences.minimumRatingCount < 0 ||
                preferences.minimumRatingCount > this.options.reviews.countMaximum)
        ) {
            throw new Error('Minimum rating count is outside the current catalog');
        }
    }
}

const gameFinderCatalog = new GameFinderCatalogService();

module.exports = {
    FACET_TYPES,
    GameFinderCatalogService,
    gameFinderCatalog,
    toRuntimeGame,
};
