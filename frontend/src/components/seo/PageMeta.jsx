import { useEffect } from 'react';

const DEFAULT_TITLE = 'Theodoros Chalkidis — Software Engineer';
const DEFAULT_DESCRIPTION =
    'Portfolio of Theodoros Chalkidis, a software engineer working across full-stack applications, distributed systems, compilers, and graphics programming.';

const upsertMeta = (selector, attribute, value, content) => {
    let element = document.head.querySelector(selector);

    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
    }

    element.setAttribute('content', content);
};

export const PageMeta = ({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    path = '/',
    type = 'website',
    structuredData,
}) => {
    useEffect(() => {
        const canonicalUrl = new URL(path, window.location.origin).toString();
        const imageUrl = new URL('/social-preview.svg', window.location.origin).toString();

        document.title = title;
        upsertMeta('meta[name="description"]', 'name', 'description', description);
        upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
        upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
        upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
        upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
        upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
        upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
        upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
        upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
        upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        const existingStructuredData = document.head.querySelector('#page-structured-data');
        existingStructuredData?.remove();

        if (structuredData) {
            const script = document.createElement('script');
            script.id = 'page-structured-data';
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }

        return () => document.head.querySelector('#page-structured-data')?.remove();
    }, [description, path, structuredData, title, type]);

    return null;
};
