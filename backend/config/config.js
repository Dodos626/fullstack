const { env } = require('./env');

const baseConfig = {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'postgres',
    logging: false,
};

module.exports = {
    development: {
        ...baseConfig,
        database: env.DB_NAME,
    },
    test: {
        ...baseConfig,
        database: env.DB_TEST_NAME,
    },
    production: {
        ...baseConfig,
        database: env.DB_NAME,
        dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    },
};
