const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('./auth.service');

const { generateAccessToken, generateRefreshToken } = require('./auth.utils');

const { registerSchema } = require('./validators/register.validator');
const { loginSchema } = require('./validators/login.validator');

const { COOKIE_EXPIRATION } = require('../../utils/constants.utils');
const { successResponse, errorResponse } = require('../../utils/apiResponse.utils');

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            errorResponse(res, 'No refresh token', 401);
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const accessToken = jwt.sign(
            {
                id: decoded.id,
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: '15m',
            }
        );

        res.json({
            accessToken,
        });
    } catch (error) {
        errorResponse(res, 'Invalid refresh token', 401);
    }
};

const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const user = await registerUser(validatedData);

        successResponse(res, user, 'User created', 201);
    } catch (error) {
        errorResponse(res, error.message, 400);
    }
};

const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await loginUser(req.body);

        const accessToken = generateAccessToken(user);

        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_EXPIRATION,
        });

        const reply = {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };

        successResponse(res, reply, 'Login Successful', 201);
    } catch (error) {
        errorResponse(res, error.message, 401);
    }
};

const logout = async (req, res) => {
    res.clearCookie('refreshToken');

    successResponse(res, null, 'Logged out', 201);
};

module.exports = {
    register,
    login,
    refresh,
    logout,
};
