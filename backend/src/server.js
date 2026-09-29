const app = require('./app');
const { env } = require('../config/env');
const { sequelize } = require('../models');

const startServer = async () => {
    try {
        await sequelize.authenticate();

        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();
