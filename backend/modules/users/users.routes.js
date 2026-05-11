const express = require('express');

const { authenticate } = require('../auth/auth.middleware');

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
    res.json({
        user: req.user,
    });
});

module.exports = router;
