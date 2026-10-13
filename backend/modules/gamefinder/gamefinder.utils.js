const crypto = require('node:crypto');
const { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } = require('./gamefinder.constants');

const createToken = () => crypto.randomBytes(24).toString('base64url');

const createRoomCode = () =>
    Array.from({ length: ROOM_CODE_LENGTH }, () => {
        const index = crypto.randomInt(0, ROOM_CODE_ALPHABET.length);
        return ROOM_CODE_ALPHABET[index];
    }).join('');

const normalizeName = (name) => name.trim().replace(/\s+/g, ' ');
const normalizeRoomCode = (code) => code.trim().toUpperCase();

const parsePayload = (schema, payload) => {
    const result = schema.safeParse(payload);

    if (result.success) {
        return result.data;
    }

    const message = result.error.issues[0]?.message || 'Invalid request';
    const error = new Error(message);
    error.code = 'VALIDATION_ERROR';
    throw error;
};

module.exports = { createRoomCode, createToken, normalizeName, normalizeRoomCode, parsePayload };
