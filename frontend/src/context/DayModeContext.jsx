import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const DAY_MODE_COOKIE = 'dayMode';
const DAY_MODE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const readDayModeCookie = () => {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${DAY_MODE_COOKIE}=`));
    if (!match) {
        return null;
    }

    const value = match.split('=')[1];
    if (value === 'day') {
        return true;
    }

    if (value === 'night') {
        return false;
    }

    return null;
};

const writeDayModeCookie = (isDayMode) => {
    if (typeof document === 'undefined') {
        return;
    }

    const value = isDayMode ? 'day' : 'night';
    document.cookie = `${DAY_MODE_COOKIE}=${value}; Path=/; Max-Age=${DAY_MODE_MAX_AGE_SECONDS}`;
};

const getSystemPreferredDayMode = () => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return true;
    }

    return !window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialDayMode = () => {
    const cookieValue = readDayModeCookie();
    return cookieValue === null ? getSystemPreferredDayMode() : cookieValue;
};

const applyThemeToDocument = (isDayMode) => {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.dataset.theme = isDayMode ? 'day' : 'night';
};

const initialDayMode = getInitialDayMode();
applyThemeToDocument(initialDayMode);

export const DayModeContext = createContext();

export const DayModeProvider = ({ children }) => {
    const [dayMode, setDayMode] = useState(() => initialDayMode);

    const toggleDayMode = useCallback(() => {
        setDayMode((current) => {
            const nextValue = !current;
            writeDayModeCookie(nextValue);
            return nextValue;
        });
    }, []);

    const updateDayMode = useCallback((value) => {
        setDayMode(() => {
            writeDayModeCookie(value);
            return value;
        });
    }, []);

    const value = useMemo(
        () => ({
            dayMode,
            setDayMode: updateDayMode,
            toggleDayMode,
        }),
        [dayMode, toggleDayMode, updateDayMode]
    );

    useEffect(() => {
        applyThemeToDocument(dayMode);
    }, [dayMode]);

    return <DayModeContext.Provider value={value}>{children}</DayModeContext.Provider>;
};
