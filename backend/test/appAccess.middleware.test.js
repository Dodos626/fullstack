const test = require('node:test');
const assert = require('node:assert/strict');
const { appAccess, enforceAppAccess } = require('../middleware/appAccess.middleware');

test('app access attaches role application configuration', () => {
    const req = { subdomain: 'guest' };

    appAccess(req, {}, () => {});

    assert.equal(req.appName, 'guest');
    assert.deepEqual(req.allowedRoles, ['guest', 'admin']);
});

test('app access rejects unknown application hosts', () => {
    const req = { subdomain: 'unknown' };
    let statusCode;
    let body;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(value) {
            body = value;
            return this;
        },
    };

    appAccess(req, res, () => {});

    assert.equal(statusCode, 404);
    assert.deepEqual(body, {
        success: false,
        message: 'Application not found',
    });
});

test('enforceAppAccess permits configured guest access', () => {
    const req = {
        allowedRoles: ['guest', 'admin'],
        user: { role: 'guest' },
    };
    let calledNext = false;

    enforceAppAccess(req, {}, () => {
        calledNext = true;
    });

    assert.equal(calledNext, true);
});
