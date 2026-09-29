const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../../models');

const registerUser = async ({ email, username, password }) => {
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{ email }, { username }],
        },
    });

    if (existingUser) {
        throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        username,
        passwordHash,
    });

    return user;
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
        throw new Error('Invalid credentials');
    }

    return user;
};

const findUserById = (id) => User.findByPk(id);

const storeRefreshTokenHash = async (user, refreshToken) => {
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save({ fields: ['refreshTokenHash'] });
};

const validateRefreshToken = async (userId, refreshToken) => {
    const user = await findUserById(userId);

    if (!user?.refreshTokenHash) {
        throw new Error('Invalid session');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isValid) {
        throw new Error('Invalid session');
    }

    return user;
};

const clearRefreshToken = async (userId) => {
    if (!userId) {
        return;
    }

    await User.update({ refreshTokenHash: null }, { where: { id: userId } });
};

module.exports = {
    registerUser,
    loginUser,
    findUserById,
    storeRefreshTokenHash,
    validateRefreshToken,
    clearRefreshToken,
};
