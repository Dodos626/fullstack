const { Op, QueryTypes } = require('sequelize');
const { GameFinderGame, GameFinderMetric, sequelize } = require('../../../models');

const RECOMMENDATION_ATTRIBUTES = [
    'steamAppId',
    'name',
    'image',
    'description',
    'steamUrl',
    'priceFinalUsd',
    'categories',
    'genres',
    'tags',
    'platforms',
    'steamReviewsPercent',
    'steamReviewsCount',
    'steamReviewsLabel',
    'catalogSyncedAt',
];

class GameFinderCatalogRepository {
    async findEnabled() {
        return GameFinderGame.findAll({
            attributes: RECOMMENDATION_ATTRIBUTES,
            where: {
                enabled: true,
                kind: 'steam',
                categories: { [Op.contains]: ['multi-player'] },
            },
            order: [['steamAppId', 'ASC']],
        });
    }

    async findMetrics() {
        return GameFinderMetric.findAll({
            order: [
                ['type', 'ASC'],
                ['count', 'DESC'],
                ['name', 'ASC'],
            ],
        });
    }

    async getCatalogSummary() {
        const rows = await sequelize.query(
            `SELECT COUNT(*)::integer AS "gameCount",
                    MIN("priceFinalUsd")::integer AS "priceMinimum",
                    MAX("priceFinalUsd")::integer AS "priceMaximum",
                    MAX("steamReviewsCount")::integer AS "ratingCountMaximum",
                    MAX("catalogSyncedAt") AS "catalogUpdatedAt"
               FROM "GameFinderGames"
              WHERE enabled = true
                AND kind = 'steam'
                AND categories @> ARRAY['multi-player']::varchar[]`,
            { type: QueryTypes.SELECT }
        );
        return rows[0];
    }

    async replaceCatalog(games, { batchSize = 500 } = {}) {
        const syncedAt = games[0]?.catalogSyncedAt;

        return sequelize.transaction(async (transaction) => {
            for (let index = 0; index < games.length; index += batchSize) {
                await GameFinderGame.bulkCreate(games.slice(index, index + batchSize), {
                    transaction,
                    updateOnDuplicate: [
                        'sourceCatalogId',
                        'kind',
                        'name',
                        'image',
                        'description',
                        'steamUrl',
                        'releaseDate',
                        'priceUsd',
                        'priceFinalUsd',
                        'discountPercent',
                        'platforms',
                        'developers',
                        'publishers',
                        'languages',
                        'categories',
                        'genres',
                        'tags',
                        'steamReviewsPercent',
                        'steamReviewsCount',
                        'steamReviewsLabel',
                        'steamRecentPercent',
                        'steamRecentCount',
                        'steamRecentLabel',
                        'sourceUpdatedAt',
                        'catalogSyncedAt',
                        'enabled',
                        'updatedAt',
                    ],
                });
            }

            await GameFinderGame.update(
                { enabled: false },
                {
                    where: {
                        kind: 'steam',
                        [Op.or]: [
                            { catalogSyncedAt: null },
                            { catalogSyncedAt: { [Op.ne]: syncedAt } },
                        ],
                    },
                    transaction,
                }
            );

            await GameFinderMetric.destroy({ where: {}, transaction });
            await this.rebuildMetrics(transaction);
            return { gameCount: games.length };
        });
    }

    async rebuildMetrics(transaction) {
        const facetColumns = {
            genre: 'genres',
            tag: 'tags',
            platform: 'platforms',
        };

        for (const [type, column] of Object.entries(facetColumns)) {
            await sequelize.query(
                `INSERT INTO gamefinder_metrics (name, type, count, "createdAt", "updatedAt")
                 SELECT value, :type, COUNT(*)::integer, NOW(), NOW()
                   FROM "GameFinderGames"
                   CROSS JOIN LATERAL unnest("${column}") AS value
                  WHERE enabled = true
                    AND kind = 'steam'
                    AND categories @> ARRAY['multi-player']::varchar[]
                    AND value <> ''
                  GROUP BY value`,
                { replacements: { type }, transaction }
            );
        }
    }
}

module.exports = { GameFinderCatalogRepository, RECOMMENDATION_ATTRIBUTES };
