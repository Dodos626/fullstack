'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {}

    User.init(
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            role: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'user',
                validate: {
                    isIn: [['admin', 'user', 'guest']],
                },
            },

            refreshTokenHash: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'User',
        }
    );

    return User;
};
