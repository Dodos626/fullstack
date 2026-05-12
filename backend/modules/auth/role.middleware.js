const { errorResponse } = require('../../utils/apiResponse.utils');

const authorize =
    (...roles) =>
    (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 'Forbidden', 403);
        }

        next();
    };

module.exports = {
    authorize,
};
