import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const serverDir = path.join(rootDir, 'dist-server');
const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
const serverEntry = await import(pathToFileURL(path.join(serverDir, 'entry-server.js')).href);
const { publicSeoRoutes, render } = serverEntry;

const escapeAttribute = (value) =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

const safeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const metadataMarkup = (route) => {
    const canonicalUrl = new URL(
        route.path,
        publicSeoRoutes[0].structuredData['@graph'][1].url
    ).toString();
    const imageUrl = new URL(route.image || '/social-preview.png', canonicalUrl).toString();
    const imageAlt = route.imageAlt || 'Theodoros Chalkidis — Software Engineer';
    const robots =
        route.robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
    const tags = [
        `<title>${escapeAttribute(route.title)}</title>`,
        `<meta name="description" content="${escapeAttribute(route.description)}" />`,
        `<meta name="robots" content="${escapeAttribute(robots)}" />`,
        `<link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />`,
        `<meta property="og:site_name" content="Theodoros Chalkidis" />`,
        `<meta property="og:locale" content="en_US" />`,
        `<meta property="og:title" content="${escapeAttribute(route.title)}" />`,
        `<meta property="og:description" content="${escapeAttribute(route.description)}" />`,
        `<meta property="og:type" content="${escapeAttribute(route.type || 'website')}" />`,
        `<meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />`,
        `<meta property="og:image" content="${escapeAttribute(imageUrl)}" />`,
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:image:type" content="image/png" />',
        `<meta property="og:image:alt" content="${escapeAttribute(imageAlt)}" />`,
        '<meta name="twitter:card" content="summary_large_image" />',
        `<meta name="twitter:title" content="${escapeAttribute(route.title)}" />`,
        `<meta name="twitter:description" content="${escapeAttribute(route.description)}" />`,
        `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}" />`,
        `<meta name="twitter:image:alt" content="${escapeAttribute(imageAlt)}" />`,
    ];

    if (route.structuredData) {
        tags.push(
            `<script id="page-structured-data" type="application/ld+json">${safeJson(route.structuredData)}</script>`
        );
    }

    return `<!-- SEO_START -->\n        ${tags.join('\n        ')}\n        <!-- SEO_END -->`;
};

const outputPathForRoute = (route) => {
    if (route.output) return path.join(distDir, route.output);
    if (route.path === '/') return path.join(distDir, 'index.html');
    return path.join(distDir, `${route.path.slice(1)}.html`);
};

for (const route of publicSeoRoutes) {
    const html = template
        .replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, metadataMarkup(route))
        .replace('<div id="root"></div>', `<div id="root">${render(route.path)}</div>`);
    const outputPath = outputPathForRoute(route);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
}

const indexedRoutes = publicSeoRoutes.filter((route) => route.index);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexedRoutes
    .map((route) => {
        const siteUrl = publicSeoRoutes[0].structuredData['@graph'][1].url;
        return `    <url><loc>${new URL(route.path, siteUrl).toString()}</loc></url>`;
    })
    .join('\n')}
</urlset>
`;
const siteUrl = publicSeoRoutes[0].structuredData['@graph'][1].url;
const robots = `User-agent: *
Allow: /
Disallow: /login
Disallow: /forbidden
Disallow: /unauthorized
Disallow: /not-available
Disallow: /not-found

Sitemap: ${new URL('/sitemap.xml', siteUrl).toString()}
`;

await writeFile(path.join(distDir, 'sitemap.xml'), sitemap);
await writeFile(path.join(distDir, 'robots.txt'), robots);
await rm(serverDir, { recursive: true, force: true });

console.log(`Pre-rendered ${publicSeoRoutes.length} routes and generated sitemap.xml.`);
