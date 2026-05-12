const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse.utils');

const verifyAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return errorResponse(res, 'No authorization header', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return errorResponse(res, 'No token provided', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        errorResponse(res, 'Invalid token', 401);
    }
};

const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'User not authenticated', 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, 'Insufficient permissions', 403);
        }

        next();
    };
};

module.exports = {
    verifyAuth,
    verifyRole,
};
