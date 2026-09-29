'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const User = require('./user')(sequelize, Sequelize.DataTypes);

module.exports = { sequelize, Sequelize, User };
