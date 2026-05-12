const { apps } = require('../config/apps.config');

const appAccess = (req, res, next) => {
    const subdomain = req.subdomain;

    if (!subdomain) {
        return next();
    }

    const app = apps[subdomain];

    if (!app) {
        return res.status(404).json({
            error: 'App not found',
        });
    }

    req.appConfig = app;

    next();
};

module.exports = {
    appAccess,
};
