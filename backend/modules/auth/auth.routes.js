const express = require('express');

const { register, login, refresh, logout } = require('./auth.controller');
const { verifyAuth } = require('../../middleware/verifyAuth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', verifyAuth, refresh);
router.post('/logout', verifyAuth, logout);

module.exports = router;
