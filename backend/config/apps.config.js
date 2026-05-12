const apps = {
    // admin panel
    admin: {
        requiresAuth: true,
        allowedRoles: ['admin'],
    },

    // guest panel
    guest: {
        requiresAuth: true,
        allowedRoles: ['guest', 'admin'],
    },

    // portfolio panel (public / landing page)
    portfolio: {
        requiresAuth: false,
    },

    // login page
    login: {
        requiresAuth: false,
    },
};

module.exports = {
    apps,
};
