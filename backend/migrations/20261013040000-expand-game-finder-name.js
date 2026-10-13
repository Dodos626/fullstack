'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            'ALTER TABLE "GameFinderGames" ALTER COLUMN name TYPE TEXT USING name::TEXT;'
        );
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            'ALTER TABLE "GameFinderGames" ALTER COLUMN name TYPE VARCHAR(255) USING name::VARCHAR(255);'
        );
    },
};
