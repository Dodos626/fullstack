const express = require('express');

const { verifyAuth, verifyRole } = require('../../middleware/verifyAuth.middleware');
const { me } = require('./users.controllers');

const router = express.Router();

router.get('/me', verifyAuth, me);

router.get('/admin-only', verifyAuth, verifyRole(['admin']), async (req, res) => {
    res.json({
        message: 'Admin access granted',
    });
});

module.exports = router;
