'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class GameFinderMetric extends Model {}

    GameFinderMetric.init(
        {
            name: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            type: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            count: { type: DataTypes.INTEGER, allowNull: false },
        },
        {
            sequelize,
            modelName: 'GameFinderMetric',
            tableName: 'gamefinder_metrics',
        }
    );

    return GameFinderMetric;
};
