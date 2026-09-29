const serializeUser = (user) => {
    if (!user) {
        return null;
    }

    const values = typeof user.get === 'function' ? user.get({ plain: true }) : user;

    return {
        id: values.id,
        email: values.email,
        username: values.username,
        role: values.role,
        createdAt: values.createdAt,
        updatedAt: values.updatedAt,
    };
};

module.exports = { serializeUser };
