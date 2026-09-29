const extractSubdomain = (req, res, next) => {
    const host = req.hostname.toLowerCase();
    const rootDomain = process.env.APP_ROOT_DOMAIN || 'lvh.me';
    const requestedApp = req.get('x-app-name')?.toLowerCase();

    if (['public', 'user', 'guest', 'admin'].includes(requestedApp)) {
        req.subdomain = requestedApp === 'public' ? null : requestedApp;
        return next();
    }

    if (host === rootDomain || host === 'localhost' || host === '127.0.0.1') {
        req.subdomain = null;
        return next();
    }

    req.subdomain = host.endsWith(`.${rootDomain}`)
        ? host.slice(0, -(rootDomain.length + 1))
        : null;

    return next();
};

module.exports = {
    extractSubdomain,
};
