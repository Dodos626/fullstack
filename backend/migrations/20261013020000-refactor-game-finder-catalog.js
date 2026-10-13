'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('GameFinderGames', 'game_finder_games_player_range');
        await queryInterface.removeIndex('GameFinderGames', 'game_finder_games_playStyles_gin');

        for (const field of [
            'minPlayers',
            'maxPlayers',
            'moods',
            'playStyles',
            'sessionLength',
            'supportsPvp',
            'difficulty',
            'storyIntensity',
            'manualTags',
        ]) {
            await queryInterface.removeColumn('GameFinderGames', field);
        }

        await queryInterface.addIndex('GameFinderGames', ['enabled'], {
            name: 'game_finder_games_enabled',
        });
        await queryInterface.addIndex('GameFinderGames', ['priceFinalUsd'], {
            name: 'game_finder_games_price_final_usd',
        });

        await queryInterface.createTable('gamefinder_metrics', {
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            count: {
                type: Sequelize.INTEGER,
                allowNull: false,
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

        await queryInterface.addIndex('gamefinder_metrics', ['type', 'count', 'name'], {
            name: 'gamefinder_metrics_type_count_name',
        });
        await queryInterface.sequelize.query(
            'ALTER TABLE gamefinder_metrics ADD CONSTRAINT gamefinder_metrics_count_positive CHECK (count > 0);'
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('gamefinder_metrics');
        await queryInterface.removeIndex('GameFinderGames', 'game_finder_games_price_final_usd');
        await queryInterface.removeIndex('GameFinderGames', 'game_finder_games_enabled');

        await queryInterface.addColumn('GameFinderGames', 'minPlayers', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        });
        await queryInterface.addColumn('GameFinderGames', 'maxPlayers', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 2,
        });
        await queryInterface.addColumn('GameFinderGames', 'moods', {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: false,
            defaultValue: [],
        });
        await queryInterface.addColumn('GameFinderGames', 'playStyles', {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: false,
            defaultValue: [],
        });
        await queryInterface.addColumn('GameFinderGames', 'sessionLength', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'unknown',
        });
        await queryInterface.addColumn('GameFinderGames', 'supportsPvp', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        await queryInterface.addColumn('GameFinderGames', 'difficulty', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'unknown',
        });
        await queryInterface.addColumn('GameFinderGames', 'storyIntensity', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('GameFinderGames', 'manualTags', {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: false,
            defaultValue: [],
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE "GameFinderGames" ADD CONSTRAINT "game_finder_games_player_range" CHECK ("minPlayers" >= 1 AND "maxPlayers" >= "minPlayers");'
        );
        await queryInterface.addIndex('GameFinderGames', ['playStyles'], {
            using: 'gin',
            name: 'game_finder_games_playStyles_gin',
        });
    },
};
