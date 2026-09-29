const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_ACCESS_SECRET = 'middleware-test-access-secret';
process.env.JWT_REFRESH_SECRET = 'middleware-test-refresh-secret';

const { env } = require('../config/env');
const { verifyAuth } = require('../middleware/verifyAuth.middleware');

const createResponse = () => {
    const result = { statusCode: null, body: null };
    result.status = (code) => {
        result.statusCode = code;
        return result;
    };
    result.json = (body) => {
        result.body = body;
        return result;
    };
    return result;
};

test('verifyAuth accepts a valid bearer token', () => {
    const token = jwt.sign({ id: 1, role: 'admin' }, env.JWT_ACCESS_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_ACCESS_AUDIENCE,
    });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    let calledNext = false;

    verifyAuth(req, res, () => {
        calledNext = true;
    });

    assert.equal(calledNext, true);
    assert.equal(req.user.id, 1);
    assert.equal(req.user.role, 'admin');
});

test('verifyAuth rejects missing credentials', () => {
    const res = createResponse();

    verifyAuth({ headers: {} }, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
});
