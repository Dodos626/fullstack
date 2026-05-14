import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const DAY_MODE_COOKIE = 'dayMode';
const DAY_MODE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const readDayModeCookie = () => {
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
    const value = isDayMode ? 'day' : 'night';
    document.cookie = `${DAY_MODE_COOKIE}=${value}; Path=/; Max-Age=${DAY_MODE_MAX_AGE_SECONDS}`;
};

export const DayModeContext = createContext();

export const DayModeProvider = ({ children }) => {
    const [dayMode, setDayMode] = useState(() => {
        const cookieValue = readDayModeCookie();
        return cookieValue === null ? true : cookieValue;
    });

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
        const theme = dayMode ? 'day' : 'night';
        document.documentElement.dataset.theme = theme;
    }, [dayMode]);

    return <DayModeContext.Provider value={value}>{children}</DayModeContext.Provider>;
};
