const test = require('node:test');
const assert = require('node:assert/strict');
const { extractSubdomain } = require('../middleware/subdomain.middleware');

const runMiddleware = (hostname) => {
    const req = { hostname, get: () => undefined };
    let calledNext = false;

    extractSubdomain(req, {}, () => {
        calledNext = true;
    });

    return { req, calledNext };
};

test('application header identifies the frontend app behind a shared API host', () => {
    const req = { hostname: 'lvh.me', get: () => 'user' };

    extractSubdomain(req, {}, () => {});

    assert.equal(req.subdomain, 'user');
});

test('application header identifies a standalone public app', () => {
    const req = { hostname: 'lvh.me', get: () => 'hello' };

    extractSubdomain(req, {}, () => {});

    assert.equal(req.subdomain, 'hello');
});

test('application header identifies the game finder app', () => {
    const req = { hostname: 'lvh.me', get: () => 'gamefinder' };

    extractSubdomain(req, {}, () => {});

    assert.equal(req.subdomain, 'gamefinder');
});

test('root lvh.me host resolves to the public app', () => {
    const result = runMiddleware('lvh.me');

    assert.equal(result.req.subdomain, null);
    assert.equal(result.calledNext, true);
});

test('role host resolves its subdomain', () => {
    const result = runMiddleware('admin.lvh.me');

    assert.equal(result.req.subdomain, 'admin');
    assert.equal(result.calledNext, true);
});
