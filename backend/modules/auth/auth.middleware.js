const jwt = require('jsonwebtoken');
const { errorResponse } = require('../../utils/apiResponse.utils');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return errorResponse(res, 'Unauthorized', 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return errorResponse(res, 'Invalid token', 401);
    }
};

module.exports = {
    authenticate,
};
