const express = require('express');
const { successResponse } = require('../../../utils/apiResponse.utils');
const { gameFinderCatalog } = require('./gamefinderCatalog.service');

const router = express.Router();

router.get('/options', async (_req, res, next) => {
    try {
        await gameFinderCatalog.refreshOptions();
        successResponse(res, gameFinderCatalog.getOptions(), 'Game Finder catalog options');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
