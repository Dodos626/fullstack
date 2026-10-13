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
    title: 'What the Hell Are We Playing?',
    description: 'Private preferences, synchronized voting, and one Steam game everyone can agree on.',
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
            </head>
            <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
        </html>
    );
}