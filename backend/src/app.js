const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { extractSubdomain } = require('../middleware/subdomain.middleware');
const { appAccess, enforceAppAccess } = require('../middleware/appAccess.middleware');
const { verifyAuth } = require('../middleware/verifyAuth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { env } = require('../config/env');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');
const { errorHandler } = require('../middleware/error.middleware');

const app = express();
app.set('trust proxy', env.TRUST_PROXY_HOPS);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || env.CORS_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Origin is not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(
    morgan('dev', {
        skip: (req) => req.path === '/api/health',
    })
);
app.use(extractSubdomain);
app.use(appAccess);

app.get('/api/health', (req, res) =>
    res.json({ success: true, data: { status: 'ok' }, message: 'API is healthy' })
);

app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/users', verifyAuth, enforceAppAccess, userRoutes);

app.use(errorHandler);

module.exports = app;
