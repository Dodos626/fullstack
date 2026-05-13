'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Users', [
            {
                email: '1',
                username: '1',
                passwordHash: await bcrypt.hash('1', 10),
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: '2',
                username: '2',
                passwordHash: await bcrypt.hash('2', 10),
                role: 'guest',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: '3',
                username: '3',
                passwordHash: await bcrypt.hash('3', 10),
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Users', null, {});
    },
};
