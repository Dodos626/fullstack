const jwt = require('jsonwebtoken');
const { registerUser, loginUser } = require('./auth.service');

const { generateAccessToken, generateRefreshToken } = require('./auth.utils');

const { registerSchema } = require('./validators/register.validator');
const { loginSchema } = require('./validators/login.validator');

const { COOKIE_EXPIRATION } = require('../../utils/constants.utils');

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'No refresh token',
            });
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
        return res.status(401).json({
            error: 'Invalid refresh token',
        });
    }
};

const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const user = await registerUser(validatedData);

        res.status(201).json({
            message: 'User created',
            user,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
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

        res.json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(401).json({
            error: error.message,
        });
    }
};

const logout = async (req, res) => {
    res.clearCookie('refreshToken');

    res.json({
        message: 'Logged out',
    });
};

module.exports = {
    register,
    login,
    refresh,
    logout,
};
