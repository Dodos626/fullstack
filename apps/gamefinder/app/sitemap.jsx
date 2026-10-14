export const dynamic = 'force-static';

export default function sitemap() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://gamefinder.lvh.me:5175';

    return [
        {
            url: siteUrl,
            changeFrequency: 'monthly',
            priority: 1,
        },
    ];
}
