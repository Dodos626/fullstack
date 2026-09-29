const jwt = require('jsonwebtoken');
const {
    registerUser,
    loginUser,
    storeRefreshTokenHash,
    validateRefreshToken,
    clearRefreshToken,
} = require('./auth.service');
const { generateAccessToken, generateRefreshToken } = require('./auth.utils');
const { registerSchema } = require('./validators/register.validator');
const { loginSchema } = require('./validators/login.validator');
const { env } = require('../../config/env');
const { COOKIE_EXPIRATION } = require('../../utils/constants.utils');
const { successResponse, errorResponse } = require('../../utils/apiResponse.utils');
const { serializeUser } = require('../../utils/user.utils');

const refreshCookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE || env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/api/auth',
    maxAge: COOKIE_EXPIRATION,
};

const clearRefreshCookie = (res) => {
    res.clearCookie('refreshToken', {
        ...refreshCookieOptions,
        maxAge: undefined,
    });
};

const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return errorResponse(res, 'Authentication required', 401);
    }

    try {
        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
            issuer: env.JWT_ISSUER,
            audience: env.JWT_ACCESS_AUDIENCE,
        });
        const user = await validateRefreshToken(decoded.id, refreshToken);
        const nextRefreshToken = generateRefreshToken(user);

        await storeRefreshTokenHash(user, nextRefreshToken);
        res.cookie('refreshToken', nextRefreshToken, refreshCookieOptions);

        return successResponse(
            res,
            {
                accessToken: generateAccessToken(user),
                user: serializeUser(user),
            },
            'Session refreshed'
        );
    } catch {
        clearRefreshCookie(res);
        return errorResponse(res, 'Invalid or expired session', 401);
    }
};

const register = async (req, res) => {
    try {
        const user = await registerUser(registerSchema.parse(req.body));
        return successResponse(res, serializeUser(user), 'User created', 201);
    } catch {
        return errorResponse(res, 'Unable to create user', 400);
    }
};

const login = async (req, res) => {
    try {
        const user = await loginUser(loginSchema.parse(req.body));
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await storeRefreshTokenHash(user, refreshToken);
        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        return successResponse(
            res,
            {
                accessToken,
                user: serializeUser(user),
            },
            'Login successful'
        );
    } catch {
        return errorResponse(res, 'Invalid credentials', 401);
    }
};

const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
                issuer: env.JWT_ISSUER,
                audience: env.JWT_ACCESS_AUDIENCE,
            });
            await clearRefreshToken(decoded.id);
        } catch {
            // Invalid and expired cookies are cleared just like active sessions.
        }
    }

    clearRefreshCookie(res);
    return successResponse(res, null, 'Logged out');
};

module.exports = {
    register,
    login,
    refresh,
    logout,
};
