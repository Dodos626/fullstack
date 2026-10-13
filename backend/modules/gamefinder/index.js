const { GameFinderStore } = require('./gamefinder.store');
const { registerGameFinderHandlers } = require('./gamefinder.handlers');

const initializeGameFinder = (io) => {
    const store = new GameFinderStore();
    registerGameFinderHandlers(io, store);
    const cleanupTimer = setInterval(() => store.cleanup(), 30 * 60 * 1000);
    cleanupTimer.unref();
    return store;
};

module.exports = { initializeGameFinder };
