const express = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { authorize } = require('../auth/role.middleware');
const { me } = require('./users.controllers');

const router = express.Router();

router.get('/me', authenticate, me);

router.get('/admin-only', authenticate, authorize('admin'), async (req, res) => {
    res.json({
        message: 'Admin access granted',
    });
});

module.exports = router;
