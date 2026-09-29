const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8).max(128),
});

module.exports = {
    loginSchema,
};
