'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            email: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING,
            },
            username: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING,
            },
            passwordHash: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            role: {
                allowNull: false,
                type: Sequelize.STRING,
                defaultValue: 'user',
            },
            refreshTokenHash: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addConstraint('Users', {
            fields: ['role'],
            type: 'check',
            where: {
                role: ['admin', 'user', 'guest'],
            },
            name: 'users_role_check',
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('Users');
    },
};
