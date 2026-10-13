'use client';

import styles from './GameFinder.module.css';

export default function ThemeToggle() {
    const toggle = () => {
        const nextIsDay = document.documentElement.dataset.theme === 'night';
        const mode = nextIsDay ? 'day' : 'night';
        document.documentElement.dataset.theme = mode;
        try {
            window.localStorage.setItem('themeMode', mode);
        } catch {
            // The current page can still switch themes when storage is unavailable.
        }
    };

    return (
        <button
            className={styles.iconButton}
            type="button"
            onClick={toggle}
            aria-label="Toggle day or night theme"
            title="Toggle day or night theme"
        >
            <span aria-hidden="true">◐</span>
        </button>
    );
}
