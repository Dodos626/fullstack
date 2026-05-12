require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

// ROUTES
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/users.routes');
const { errorHandler } = require('../middleware/error.middleware');

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
app.use(morgan('dev'));

// ROUTING STARTS HERE
// TODO PUT THOSE IN DIFFERENT FILE

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

// error
app.use(errorHandler);

module.exports = app;
