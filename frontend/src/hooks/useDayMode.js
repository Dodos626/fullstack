import { useContext } from 'react';
import { DayModeContext } from '../context/DayModeContext';

export const useDayMode = () => {
    const context = useContext(DayModeContext);

    if (!context) {
        throw new Error('useDayMode must be used within a DayModeProvider');
    }

    return context;
};
