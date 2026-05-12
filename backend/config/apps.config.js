const apps = {
    // admin panel
    admin: {
        requiresAuth: true,
        allowedRoles: ['admin'],
    },

    // portfolio panel (public / landing page)
    portfolio: {
        requiresAuth: false,
    },
};

module.exports = {
    apps,
};
