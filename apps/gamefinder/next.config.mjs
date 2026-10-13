import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['gamefinder.lvh.me', 'localhost', '127.0.0.1'],
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    turbopack: {
        root: projectRoot,
    },
};

export default nextConfig;