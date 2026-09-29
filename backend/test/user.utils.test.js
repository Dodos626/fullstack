const test = require('node:test');
const assert = require('node:assert/strict');
const { serializeUser } = require('../utils/user.utils');

test('serializeUser excludes password and refresh token hashes', () => {
    const result = serializeUser({
        id: 1,
        email: 'user@example.com',
        username: 'user',
        role: 'user',
        passwordHash: 'secret',
        refreshTokenHash: 'refresh-secret',
    });

    assert.deepEqual(result, {
        id: 1,
        email: 'user@example.com',
        username: 'user',
        role: 'user',
        createdAt: undefined,
        updatedAt: undefined,
    });
    assert.equal('passwordHash' in result, false);
    assert.equal('refreshTokenHash' in result, false);
});
