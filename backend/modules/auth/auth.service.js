const bcrypt = require('bcrypt');

const { User } = require('../../models');

const registerUser = async ({ email, username, password }) => {
    const existingUser = await User.findOne({
        where: {
            email,
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

module.exports = {
    registerUser,
    loginUser,
};
