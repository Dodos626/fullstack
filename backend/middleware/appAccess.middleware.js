const { apps } = require('../config/apps.config');
const { errorResponse } = require('../utils/apiResponse.utils');

const appAccess = (req, res, next) => {
    const appName = req.subdomain || 'public';
    const app = apps[appName];

    if (!Object.hasOwn(apps, appName)) {
        return res.status(404).json({
            success: false,
            message: 'Application not found',
        });
    }

    req.allowedRoles = app;
    req.appName = appName;

    return next();
};

const enforceAppAccess = (req, res, next) => {
    if (!req.allowedRoles) {
        return next();
    }

    if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
    }

    if (!req.allowedRoles.includes(req.user.role)) {
        return errorResponse(res, 'Application access denied', 403);
    }

    return next();
};

module.exports = {
    appAccess,
    enforceAppAccess,
};
