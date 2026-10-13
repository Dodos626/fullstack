const app = require('./app');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { env } = require('../config/env');
const { sequelize } = require('../models');
const { initializeGameFinder } = require('../modules/gamefinder');
const { gameFinderCatalog } = require('../modules/gamefinder/catalog/gamefinderCatalog.service');

const startServer = async () => {
    try {
        await sequelize.authenticate();
        await gameFinderCatalog.load();

        const httpServer = createServer(app);
        const io = new Server(httpServer, {
            cors: {
                origin: env.CORS_ORIGINS,
                credentials: true,
            },
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000,
                skipMiddlewares: false,
            },
        });

        initializeGameFinder(io);

        httpServer.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();
