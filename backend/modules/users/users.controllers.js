const { User } = require('../../models');
const { successResponse } = require('../../utils/apiResponse.utils');

const me = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: {
            exclude: ['passwordHash'],
        },
    });

    successResponse(res, user, 'Me is you');
};

module.exports = { me };
