const { gameFinderCatalog } = require('./gamefinderCatalog.service');

module.exports = {
    gameFinderCatalog,
    get games() {
        return gameFinderCatalog.getGames();
    },
    get gamesById() {
        return gameFinderCatalog.getGamesById();
    },
};
