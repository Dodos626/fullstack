import { createContext, useCallback, useEffect, useState } from 'react';

const THEME_MODE_STORAGE_KEY = 'themeMode';

const getInitialDayMode = () => {
    if (typeof document !== 'undefined') {
        const documentMode = document.documentElement.dataset.theme;
        if (documentMode === 'day' || documentMode === 'night') {
            return documentMode === 'day';
        }
    }

    if (typeof window === 'undefined') {
        return false;
    }

    try {
        const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (storedMode === 'day' || storedMode === 'night') {
            return storedMode === 'day';
        }
    } catch {
        // Use the system preference when storage is unavailable.
    }

    return !window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyThemeToDocument = (isDayMode) => {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.dataset.theme = isDayMode ? 'day' : 'night';
};

export const DayModeContext = createContext();

export const DayModeProvider = ({ children }) => {
    const [dayMode, setDayMode] = useState(false);

    useEffect(() => {
        const initialModeTimer = window.setTimeout(() => setDayMode(getInitialDayMode()), 0);
        return () => window.clearTimeout(initialModeTimer);
    }, []);

    const toggleDayMode = useCallback(() => {
        setDayMode((current) => {
            const nextValue = !current;
            const mode = nextValue ? 'day' : 'night';

            try {
                window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
            } catch {
                // Theme still works for the current session when storage is unavailable.
            }

            applyThemeToDocument(nextValue);
            return nextValue;
        });
    }, []);

    return (
        <DayModeContext.Provider value={{ dayMode, toggleDayMode }}>
            {children}
        </DayModeContext.Provider>
    );
};
