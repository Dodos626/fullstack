import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const bodyFont = IBM_Plex_Sans({
    subsets: ['latin'],
    variable: '--font-body',
    weight: ['400', '500', '600'],
});
const headingFont = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-heading',
    weight: ['400', '500', '600', '700'],
});

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://gamefinder.lvh.me:5175'),
    title: 'What the Hell Are We Playing? — Multiplayer Steam Game Finder',
    description:
        'Create a room, answer privately, vote together, and let an adaptive recommendation engine find a Steam game your group wants to play.',
    applicationName: 'What the Hell Are We Playing?',
    authors: [{ name: 'Theodoros Chalkidis', url: process.env.NEXT_PUBLIC_PORTFOLIO_URL }],
    creator: 'Theodoros Chalkidis',
    alternates: { canonical: '/' },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        siteName: 'What the Hell Are We Playing?',
        title: 'What the Hell Are We Playing? — Multiplayer Steam Game Finder',
        description:
            'Private preferences, synchronized voting, and adaptive Steam recommendations for groups.',
        images: [
            {
                url: '/social-preview.png',
                width: 1200,
                height: 630,
                alt: 'What the Hell Are We Playing? multiplayer Steam game finder',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'What the Hell Are We Playing? — Multiplayer Steam Game Finder',
        description:
            'Private preferences, synchronized voting, and adaptive Steam recommendations for groups.',
        images: ['/social-preview.png'],
    },
};

const applicationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'What the Hell Are We Playing?',
    alternateName: 'Game Finder',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web browser',
    isAccessibleForFree: true,
    description:
        'A real-time multiplayer preference and voting application that recommends Steam games for groups.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://gamefinder.lvh.me:5175',
    author: {
        '@type': 'Person',
        name: 'Theodoros Chalkidis',
        url: process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'http://lvh.me:5173',
    },
    featureList: [
        'Real-time multiplayer rooms',
        'Private preference questionnaires',
        'Synchronized private voting',
        'Adaptive Steam game recommendations',
        'Explainable ranked results',
    ],
};

const themeScript = `
(function () {
    var storedMode = null;
    try { storedMode = window.localStorage.getItem('themeMode'); } catch (error) {}
    var isDay = storedMode === 'day' || (storedMode !== 'night' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = isDay ? 'day' : 'night';
})();`;

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationStructuredData) }}
                />
            </head>
            <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
        </html>
    );
}
