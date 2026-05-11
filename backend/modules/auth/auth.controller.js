const { registerUser, loginUser } = require('./auth.service');

const { generateAccessToken, generateRefreshToken } = require('./auth.utils');

const register = async (req, res) => {
    try {
        const user = await registerUser(req.body);

        res.status(201).json({
            message: 'User created',
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        console.log(req.body);
        const user = await loginUser(req.body);

        const accessToken = generateAccessToken(user);

        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
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

module.exports = {
    register,
    login,
};
