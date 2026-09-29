const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { errorResponse } = require('../utils/apiResponse.utils');

const verifyAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return errorResponse(res, 'Authentication required', 401);
    }

    const token = authHeader.slice('Bearer '.length);

    try {
        req.user = jwt.verify(token, env.JWT_ACCESS_SECRET, {
            issuer: env.JWT_ISSUER,
            audience: env.JWT_ACCESS_AUDIENCE,
        });
        return next();
    } catch {
        return errorResponse(res, 'Invalid or expired access token', 401);
    }
};

module.exports = { verifyAuth };
