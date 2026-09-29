const express = require('express');

const { me } = require('./users.controllers');

const router = express.Router();

router.get('/me', me);

module.exports = router;
