const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const MIN_ROUNDS = 4;
const MAX_ROUNDS = 12;
const DEFAULT_ROUNDS = 8;
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

const PHASES = {
    LOBBY: 'lobby',
    QUESTIONNAIRE: 'questionnaire',
    VOTING: 'voting',
    RESULTS: 'results',
};

const VOTE_VALUES = {
    like: 2,
    maybe: 1,
    skipped: 0,
    dislike: -2,
};

module.exports = {
    DEFAULT_ROUNDS,
    MAX_PLAYERS,
    MAX_ROUNDS,
    MIN_PLAYERS,
    MIN_ROUNDS,
    PHASES,
    ROOM_CODE_ALPHABET,
    ROOM_CODE_LENGTH,
    ROOM_TTL_MS,
    VOTE_VALUES,
};
