const test = require('node:test');
const assert = require('node:assert/strict');
const { loginSchema } = require('../modules/auth/validators/login.validator');
const { registerSchema } = require('../modules/auth/validators/register.validator');

test('login validator normalizes email addresses', () => {
    const result = loginSchema.parse({
        email: '  USER@EXAMPLE.COM ',
        password: 'Password123!',
    });

    assert.equal(result.email, 'user@example.com');
});

test('register validator rejects short passwords', () => {
    const result = registerSchema.safeParse({
        email: 'user@example.com',
        username: 'user',
        password: 'short',
    });

    assert.equal(result.success, false);
});
