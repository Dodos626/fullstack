const test = require('node:test');
const assert = require('node:assert/strict');
const {
    isMultiplayerSteamGame,
    normalizeGame,
} = require('../modules/gamefinder/catalog/sync-steamdb');
const {
    GameFinderCatalogService,
} = require('../modules/gamefinder/catalog/gamefinderCatalog.service');

const steamGame = (overrides = {}) => ({
    id: 1,
    kind: 'steam',
    steam_appid: 550,
    steam_url: 'https://store.steampowered.com/app/550',
    name: 'Left 4 Dead 2',
    categories: ['Single-player', 'Online Co-op'],
    genres: ['Action'],
    tags: ['Zombies', 'Co-op'],
    platforms: ['WIN'],
    release_date: '2009-11-16',
    ...overrides,
});

test('catalog filter accepts only Steam games with multiplayer categories and a store URL', () => {
    assert.equal(isMultiplayerSteamGame(steamGame()), true);
    assert.equal(isMultiplayerSteamGame(steamGame({ categories: ['Single-player'] })), false);
    assert.equal(isMultiplayerSteamGame(steamGame({ kind: 'gog_exclusive' })), false);
    assert.equal(isMultiplayerSteamGame(steamGame({ steam_url: null })), false);
    assert.equal(isMultiplayerSteamGame(steamGame({ release_date: null })), false);
    assert.equal(isMultiplayerSteamGame(steamGame({ release_date: '2999-01-01' })), false);
});

test('catalog normalization produces source-backed recommendation fields', () => {
    const game = normalizeGame(steamGame({ price_final_usd: null, genres: ['Free to Play'] }));
    assert.equal(game.steamAppId, 550);
    assert.equal(game.priceFinalUsd, 0);
    assert.deepEqual(game.categories, ['single-player', 'online-co-op']);
    assert.deepEqual(game.tags, ['zombies', 'co-op']);
});

test('questionnaire facets select a multi-select above fifteen values', () => {
    const metrics = Array.from({ length: 16 }, (_, index) => ({
        type: 'tag',
        name: `tag-${index}`,
        count: 100 - index,
    }));
    const service = new GameFinderCatalogService();
    const options = service.buildOptions(metrics, {
        gameCount: 100,
        priceMinimum: 0,
        priceMaximum: 2599,
        ratingCountMaximum: 500000,
    });
    assert.equal(options.facets.tags.control, 'multi-select');
    assert.equal(options.facets.tags.options[0].name, 'tag-0');
    assert.equal(options.price.maximum, 3000);
    assert.equal(options.reviews.countMaximum, 500000);
    assert.ok(service.buildFeatureWeights(metrics, 100).get('tag:tag-15') > 0);
});

test('catalog validation rejects values absent from current metrics', () => {
    const service = new GameFinderCatalogService();
    service.options = service.buildOptions([{ type: 'genre', name: 'action', count: 10 }], {
        gameCount: 10,
        priceMinimum: 0,
        priceMaximum: 5000,
        ratingCountMaximum: 10000,
    });
    assert.throws(
        () =>
            service.validatePreferences({
                includedGenres: ['fake'],
                excludedGenres: [],
                includedTags: [],
                excludedTags: [],
                includedCategories: [],
                excludedCategories: [],
                platforms: [],
                priceFilterEnabled: false,
                priceMinUsd: 0,
                priceMaxUsd: 5000,
                ratingFilterEnabled: false,
                minimumRating: 0,
                ratingCountFilterEnabled: false,
                minimumRatingCount: 0,
            }),
        /Unknown included genre/
    );
});
