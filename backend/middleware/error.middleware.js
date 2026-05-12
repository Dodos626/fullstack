const { errorResponse } = require('../utils/apiResponse.utils');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    return errorResponse(
        res,
        {
            error: err.message || 'Internal server error',
        },
        500
    );
};

module.exports = {
    errorHandler,
};
