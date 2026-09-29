'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Users');
        const legacyUsers = [
            {
                email: '1',
                username: '1',
                nextEmail: 'admin@example.com',
                nextUsername: 'demo-admin',
                passwordHash: await bcrypt.hash('Admin123!', 10),
            },
            {
                email: '2',
                username: '2',
                nextEmail: 'guest@example.com',
                nextUsername: 'demo-guest',
                passwordHash: await bcrypt.hash('Guest123!', 10),
            },
            {
                email: '3',
                username: '3',
                nextEmail: 'user@example.com',
                nextUsername: 'demo-user',
                passwordHash: await bcrypt.hash('User123!', 10),
            },
        ];

        if (!table.refreshTokenHash) {
            await queryInterface.addColumn('Users', 'refreshTokenHash', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }

        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.sequelize.query(
                `DELETE FROM "Users" duplicate
                 USING "Users" original
                 WHERE duplicate.id > original.id
                   AND (
                       duplicate.email = original.email
                       OR duplicate.username = original.username
                   );`,
                { transaction }
            );

            for (const legacyUser of legacyUsers) {
                await queryInterface.sequelize.query(
                    `UPDATE "Users"
                     SET email = :nextEmail,
                         username = :nextUsername,
                         "passwordHash" = :passwordHash,
                         "updatedAt" = NOW()
                     WHERE email = :email
                        OR username = :username;`,
                    {
                        replacements: legacyUser,
                        transaction,
                    }
                );
            }
        });

        await queryInterface.changeColumn('Users', 'email', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        });
        await queryInterface.changeColumn('Users', 'username', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        });
        await queryInterface.changeColumn('Users', 'passwordHash', {
            type: Sequelize.STRING,
            allowNull: false,
        });
        await queryInterface.changeColumn('Users', 'role', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'user',
        });

        await queryInterface.sequelize.query(
            'ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "users_role_check";'
        );
        await queryInterface.sequelize.query(
            'ALTER TABLE "Users" ADD CONSTRAINT "users_role_check" CHECK ("role" IN (\'admin\', \'user\', \'guest\'));'
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Users', 'refreshTokenHash');
        await queryInterface.sequelize.query(
            'ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "users_role_check";'
        );
    },
};
