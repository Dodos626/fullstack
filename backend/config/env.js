const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const booleanFromString = z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true');

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(1).default(0),
    JWT_ACCESS_SECRET: z.string().min(16).optional(),
    JWT_REFRESH_SECRET: z.string().min(16).optional(),
    JWT_ISSUER: z.string().min(1).default('fullstack-api'),
    JWT_ACCESS_AUDIENCE: z.string().min(1).default('fullstack-web'),
    COOKIE_DOMAIN: z.string().optional(),
    COOKIE_SECURE: booleanFromString,
    DB_HOST: z.string().min(1).default('localhost'),
    DB_PORT: z.coerce.number().int().positive().default(5432),
    DB_USER: z.string().min(1).default('postgres'),
    DB_PASSWORD: z.string().default('postgres'),
    DB_NAME: z.string().min(1).default('app_db'),
    DB_TEST_NAME: z.string().min(1).default('app_db_test'),
    DB_SSL: booleanFromString,
    CORS_ORIGINS: z
        .string()
        .default(
            'http://lvh.me:5173,http://user.lvh.me:5173,http://guest.lvh.me:5173,http://admin.lvh.me:5173,http://localhost:5173,http://127.0.0.1:5173'
        ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const issues = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
    throw new Error(`Invalid environment configuration: ${issues}`);
}

const env = {
    ...parsed.data,
    CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
};

if (env.NODE_ENV === 'production' && (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET)) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required in production');
}

env.JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET || 'development-access-secret';
env.JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || 'development-refresh-secret';

module.exports = { env };
