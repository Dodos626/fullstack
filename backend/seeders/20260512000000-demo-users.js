'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const users = [
            {
                email: 'admin@example.com',
                username: 'demo-admin',
                passwordHash: await bcrypt.hash('Admin123!', 10),
                role: 'admin',
                createdAt: now,
                updatedAt: now,
            },
            {
                email: 'guest@example.com',
                username: 'demo-guest',
                passwordHash: await bcrypt.hash('Guest123!', 10),
                role: 'guest',
                createdAt: now,
                updatedAt: now,
            },
            {
                email: 'user@example.com',
                username: 'demo-user',
                passwordHash: await bcrypt.hash('User123!', 10),
                role: 'user',
                createdAt: now,
                updatedAt: now,
            },
        ];

        for (const user of users) {
            await queryInterface.bulkInsert('Users', [user], {
                ignoreDuplicates: true,
            });
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('Users', {
            email: ['admin@example.com', 'guest@example.com', 'user@example.com'],
        });
    },
};
