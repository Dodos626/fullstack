const zlib = require('node:zlib');
const { pipeline } = require('node:stream/promises');
const { Readable, Writable } = require('node:stream');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const { GameFinderCatalogRepository } = require('./gamefinderCatalog.repository');

const SOURCE_URL =
    process.env.STEAMDB_URL ||
    'https://github.com/leinstay/steamdb/releases/latest/download/steamdb.min.json.gz';
const MULTIPLAYER_CATEGORIES = new Set(['multi-player']);

const slugify = (value) =>
    value
        .trim()
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const cleanList = (values) => [
    ...new Set((Array.isArray(values) ? values : []).map(slugify).filter(Boolean)),
];

const cleanNames = (values) => [
    ...new Set((Array.isArray(values) ? values : []).filter((value) => typeof value === 'string')),
];

const cleanDescription = (value) =>
    String(value || '')
        .replace(/<br\s*\/?\s*>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const currentDate = () => new Date().toISOString().slice(0, 10);

const isMultiplayerSteamGame = (game, today = currentDate()) => {
    if (
        game?.kind !== 'steam' ||
        !Number.isInteger(game.steam_appid) ||
        typeof game.steam_url !== 'string' ||
        !game.steam_url.startsWith('https://store.steampowered.com/app/') ||
        typeof game.release_date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(game.release_date) ||
        game.release_date > today
    ) {
        return false;
    }

    return cleanList(game.categories).includes('multi-player');
};

const normalizeGame = (game, catalogSyncedAt = new Date()) => {
    const genres = cleanList(game.genres);
    const tags = cleanList(game.tags);
    const categories = cleanList(game.categories);
    const isFreeToPlay = [...genres, ...tags, ...categories].some((value) =>
        ['free-to-play', 'free-to-play-games', 'free'].includes(value)
    );

    return {
        steamAppId: game.steam_appid,
        sourceCatalogId: game.id,
        kind: 'steam',
        name: String(game.name || `Steam App ${game.steam_appid}`).trim(),
        image: game.image || null,
        description: cleanDescription(game.description),
        steamUrl: game.steam_url,
        priceUsd: Number.isInteger(game.price_usd) ? game.price_usd : null,
        priceFinalUsd: Number.isInteger(game.price_final_usd)
            ? game.price_final_usd
            : isFreeToPlay
              ? 0
              : null,
        discountPercent: Number.isInteger(game.discount_percent) ? game.discount_percent : null,
        releaseDate: game.release_date || null,
        platforms: cleanList(game.platforms),
        developers: cleanNames(game.developers),
        publishers: cleanNames(game.publishers),
        languages: cleanNames(game.languages),
        categories,
        genres,
        tags,
        steamReviewsPercent: game.steam_reviews_percent ?? null,
        steamReviewsCount: game.steam_reviews_count ?? null,
        steamReviewsLabel: game.steam_reviews_label || null,
        steamRecentPercent: game.steam_recent_percent ?? null,
        steamRecentCount: game.steam_recent_count ?? null,
        steamRecentLabel: game.steam_recent_label || null,
        sourceUpdatedAt: game.updated_at || null,
        catalogSyncedAt,
        enabled: true,
    };
};

const download = async () => {
    console.log(`Downloading ${SOURCE_URL}`);
    const response = await fetch(SOURCE_URL, {
        headers: { 'user-agent': 'fullstack-gamefinder-catalog-sync' },
        redirect: 'follow',
    });
    if (!response.ok || !response.body) {
        throw new Error(`SteamDB download failed with HTTP ${response.status}`);
    }
    return response;
};

const collectMultiplayerGames = async (response, catalogSyncedAt = new Date()) => {
    const gamesById = new Map();

    await pipeline(
        Readable.fromWeb(response.body),
        zlib.createGunzip(),
        parser(),
        streamArray(),
        new Writable({
            objectMode: true,
            write({ value }, _encoding, callback) {
                if (isMultiplayerSteamGame(value)) {
                    gamesById.set(value.steam_appid, normalizeGame(value, catalogSyncedAt));
                }
                callback();
            },
        })
    );

    return [...gamesById.values()];
};

const sync = async () => {
    const response = await download();
    const games = await collectMultiplayerGames(response);
    if (!games.length)
        throw new Error('SteamDB refresh did not contain any multiplayer Steam games');

    const repository = new GameFinderCatalogRepository();
    await repository.replaceCatalog(games);
    console.log(`Imported ${games.length} multiplayer-capable Steam games into PostgreSQL`);
    return games.length;
};

if (require.main === module) {
    sync().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = {
    MULTIPLAYER_CATEGORIES,
    cleanList,
    collectMultiplayerGames,
    isMultiplayerSteamGame,
    normalizeGame,
    sync,
};
