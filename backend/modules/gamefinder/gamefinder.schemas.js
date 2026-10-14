const { z } = require('zod');
const { MAX_FACET_SELECTIONS, MAX_ROUNDS, MIN_ROUNDS } = require('./gamefinder.constants');

const displayName = z.string().trim().min(2).max(24);
const roomCode = z
    .string()
    .trim()
    .length(6)
    .transform((value) => value.toUpperCase());
const token = z.string().min(20).max(200);

const createRoomSchema = z.object({
    displayName,
    maxGames: z.coerce.number().int().min(MIN_ROUNDS).max(MAX_ROUNDS).default(8),
});

const joinRoomSchema = z.object({ roomCode, displayName });
const resumeRoomSchema = z.object({ roomCode, playerId: token, reconnectToken: token });
const roomActionSchema = resumeRoomSchema;

const facetValue = z.string().trim().min(1).max(80);
const facets = z.array(facetValue).max(MAX_FACET_SELECTIONS).default([]);
const preferenceSchema = z
    .object({
        includedGenres: facets,
        excludedGenres: facets,
        includedTags: facets,
        excludedTags: facets,
        platforms: facets,
        priceFilterEnabled: z.boolean().default(false),
        priceMinUsd: z.number().int().min(0).max(1000000),
        priceMaxUsd: z.number().int().min(0).max(1000000),
        ratingFilterEnabled: z.boolean().default(false),
        minimumRating: z.number().int().min(0).max(100).default(0),
        ratingCountFilterEnabled: z.boolean().default(false),
        minimumRatingCount: z.number().int().min(0).max(10000000).default(0),
    })
    .refine((preferences) => preferences.priceMinUsd <= preferences.priceMaxUsd, {
        message: 'Minimum price cannot be higher than maximum price',
        path: ['priceMinUsd'],
    })
    .refine(
        (preferences) =>
            !preferences.includedGenres.some((genre) => preferences.excludedGenres.includes(genre)),
        {
            message: 'A genre cannot be both included and excluded',
            path: ['excludedGenres'],
        }
    )
    .refine(
        (preferences) =>
            !preferences.includedTags.some((tag) => preferences.excludedTags.includes(tag)),
        { message: 'A tag cannot be both included and excluded', path: ['excludedTags'] }
    );

const preferencesSubmitSchema = resumeRoomSchema.extend({ preferences: preferenceSchema });
const voteSubmitSchema = resumeRoomSchema.extend({
    gameId: z.number().int().positive(),
    vote: z.enum(['like', 'maybe', 'dislike']),
});

module.exports = {
    createRoomSchema,
    joinRoomSchema,
    preferencesSubmitSchema,
    resumeRoomSchema,
    roomActionSchema,
    voteSubmitSchema,
};
