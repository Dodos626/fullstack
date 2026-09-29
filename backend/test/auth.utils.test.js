const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_ACCESS_SECRET = 'test-access-secret-value';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-value';
process.env.JWT_ISSUER = 'fullstack-api';
process.env.JWT_ACCESS_AUDIENCE = 'fullstack-web';

const { env } = require('../config/env');
const { generateAccessToken, generateRefreshToken } = require('../modules/auth/auth.utils');

test('access tokens include role, issuer, and audience', () => {
    const token = generateAccessToken({ id: 7, role: 'admin' });
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_ACCESS_AUDIENCE,
    });

    assert.equal(payload.id, 7);
    assert.equal(payload.role, 'admin');
});

test('refresh tokens identify the user without exposing a role', () => {
    const token = generateRefreshToken({ id: 8, role: 'guest' });
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_ACCESS_AUDIENCE,
    });

    assert.equal(payload.id, 8);
    assert.equal(payload.role, undefined);
});
