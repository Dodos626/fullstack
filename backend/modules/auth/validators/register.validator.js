const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    username: z.string().trim().min(3).max(40),
    password: z.string().min(8).max(128),
});

module.exports = {
    registerSchema,
};
