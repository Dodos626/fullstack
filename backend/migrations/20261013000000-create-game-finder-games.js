'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('GameFinderGames', {
            steamAppId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            sourceCatalogId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            kind: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'steam',
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            image: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            steamUrl: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            releaseDate: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            priceUsd: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            priceFinalUsd: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            discountPercent: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            platforms: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            developers: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            publishers: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            languages: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            categories: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            genres: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            tags: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            steamReviewsPercent: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            steamReviewsCount: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            steamReviewsLabel: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            steamRecentPercent: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            steamRecentCount: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            steamRecentLabel: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            sourceUpdatedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            minPlayers: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            maxPlayers: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            moods: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            playStyles: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            sessionLength: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            supportsPvp: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            difficulty: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            storyIntensity: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            manualTags: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: [],
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE "GameFinderGames" ADD CONSTRAINT "game_finder_games_kind_steam" CHECK (kind = \'steam\');'
        );
        await queryInterface.sequelize.query(
            'ALTER TABLE "GameFinderGames" ADD CONSTRAINT "game_finder_games_player_range" CHECK ("minPlayers" >= 1 AND "maxPlayers" >= "minPlayers");'
        );
        await queryInterface.sequelize.query(
            'ALTER TABLE "GameFinderGames" ADD CONSTRAINT "game_finder_games_review_percent" CHECK (("steamReviewsPercent" IS NULL OR "steamReviewsPercent" BETWEEN 0 AND 100) AND ("steamRecentPercent" IS NULL OR "steamRecentPercent" BETWEEN 0 AND 100));'
        );

        for (const field of ['platforms', 'categories', 'genres', 'tags', 'playStyles']) {
            await queryInterface.addIndex('GameFinderGames', [field], {
                using: 'gin',
                name: `game_finder_games_${field}_gin`,
            });
        }
    },

    async down(queryInterface) {
        await queryInterface.dropTable('GameFinderGames');
    },
};
