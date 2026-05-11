const authorize =
    (...roles) =>
    (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
            });
        }

        next();
    };

module.exports = {
    authorize,
};
