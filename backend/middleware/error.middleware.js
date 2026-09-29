const { errorResponse } = require('../utils/apiResponse.utils');

const errorHandler = (err, _req, res, _next) => {
    console.error(err);

    return errorResponse(res, 'Internal server error', 500);
};

module.exports = {
    errorHandler,
};
