'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class GameFinderGame extends Model {}

    GameFinderGame.init(
        {
            steamAppId: { type: DataTypes.INTEGER, primaryKey: true },
            sourceCatalogId: DataTypes.INTEGER,
            kind: { type: DataTypes.STRING, allowNull: false, defaultValue: 'steam' },
            name: { type: DataTypes.TEXT, allowNull: false },
            image: DataTypes.TEXT,
            description: DataTypes.TEXT,
            steamUrl: { type: DataTypes.TEXT, allowNull: false },
            releaseDate: DataTypes.DATEONLY,
            priceUsd: DataTypes.INTEGER,
            priceFinalUsd: DataTypes.INTEGER,
            discountPercent: DataTypes.INTEGER,
            platforms: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false,
                defaultValue: [],
            },
            developers: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: false,
                defaultValue: [],
            },
            publishers: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: false,
                defaultValue: [],
            },
            languages: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: false,
                defaultValue: [],
            },
            categories: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false,
                defaultValue: [],
            },
            genres: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
            tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false, defaultValue: [] },
            steamReviewsPercent: DataTypes.INTEGER,
            steamReviewsCount: DataTypes.INTEGER,
            steamReviewsLabel: DataTypes.STRING,
            steamRecentPercent: DataTypes.INTEGER,
            steamRecentCount: DataTypes.INTEGER,
            steamRecentLabel: DataTypes.STRING,
            sourceUpdatedAt: DataTypes.DATE,
            catalogSyncedAt: DataTypes.DATE,
            enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        },
        {
            sequelize,
            modelName: 'GameFinderGame',
        }
    );

    return GameFinderGame;
};
