const { User } = require('../../models');
const { successResponse, errorResponse } = require('../../utils/apiResponse.utils');
const { serializeUser } = require('../../utils/user.utils');

const me = async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, serializeUser(user), 'Current user');
};

module.exports = { me };
