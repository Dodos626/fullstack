const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');

const tokenOptions = {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_ACCESS_AUDIENCE,
};

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: '15m',
            ...tokenOptions,
        }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: '7d',
            ...tokenOptions,
        }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};
