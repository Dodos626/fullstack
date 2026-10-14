import { useEffect } from 'react';
import {
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE_PATH,
    DEFAULT_ROBOTS,
    DEFAULT_TITLE,
    SITE_NAME,
    absoluteImageUrl,
    absoluteUrl,
} from '../../seo/siteMetadata';

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
    image = DEFAULT_IMAGE_PATH,
    imageAlt = 'Theodoros Chalkidis — Software Engineer',
    robots = DEFAULT_ROBOTS,
}) => {
    useEffect(() => {
        const canonicalUrl = absoluteUrl(path);
        const imageUrl = absoluteImageUrl(image);

        document.title = title;
        upsertMeta('meta[name="description"]', 'name', 'description', description);
        upsertMeta('meta[name="robots"]', 'name', 'robots', robots);
        upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
        upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');
        upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
        upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
        upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
        upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
        upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
        upsertMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
        upsertMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
        upsertMeta('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/png');
        upsertMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', imageAlt);
        upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
        upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
        upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
        upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
        upsertMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', imageAlt);

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
    }, [description, image, imageAlt, path, robots, structuredData, title, type]);

    return null;
};
