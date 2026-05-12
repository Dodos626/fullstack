const extractSubdomain = (req, res, next) => {
    const host = req.hostname;

    const parts = host.split('.');

    let subdomain = null;

    if (parts.length > 2) {
        subdomain = parts[0];
    }

    req.subdomain = subdomain;

    next();
};

module.exports = {
    extractSubdomain,
};
