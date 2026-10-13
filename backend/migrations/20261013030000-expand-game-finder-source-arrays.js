'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        for (const field of ['developers', 'publishers', 'languages']) {
            await queryInterface.sequelize.query(
                `ALTER TABLE "GameFinderGames" ALTER COLUMN "${field}" TYPE TEXT[] USING "${field}"::TEXT[];`
            );
        }
    },

    async down(queryInterface) {
        for (const field of ['developers', 'publishers', 'languages']) {
            await queryInterface.sequelize.query(
                `ALTER TABLE "GameFinderGames" ALTER COLUMN "${field}" TYPE VARCHAR(255)[] USING "${field}"::VARCHAR(255)[];`
            );
        }
    },
};
