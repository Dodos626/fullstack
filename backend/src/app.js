require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// ROUTES
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

module.exports = app;
