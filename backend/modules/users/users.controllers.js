const { User } = require('../../models');

const me = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: {
            exclude: ['passwordHash'],
        },
    });

    res.json(user);
};

module.exports = { me };
