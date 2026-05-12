'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const passwordHashAdmin = await bcrypt.hash('admin123', 10);
        const passwordHashGuest = await bcrypt.hash('guest123', 10);

        await queryInterface.bulkInsert('Users', [
            {
                email: 'admin@example.com',
                username: 'admin',
                passwordHash: passwordHashAdmin,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'guest@example.com',
                username: 'guest',
                passwordHash: passwordHashGuest,
                role: 'guest',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'user@example.com',
                username: 'user',
                passwordHash: passwordHashGuest,
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
