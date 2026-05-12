const successResponse = (res, data = null, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
};

const errorResponse = (res, message = 'Error', status = 500) => {
    return res.status(status).json({
        success: false,
        message,
    });
};

module.exports = {
    successResponse,
    errorResponse,
};
