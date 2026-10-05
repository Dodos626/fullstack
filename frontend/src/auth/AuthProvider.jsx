import { createContext, useState, useEffect, useCallback } from 'react';
import api, {
    requestRefresh,
    setAccessToken as setApiAccessToken,
    setAuthFailureHandler,
} from '../api/client';
import { getPublicUrl, navigateToUrl } from '../config/apps';
import { isDevMode } from '../config/features';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setApiAccessToken(accessToken);
    }, [accessToken]);

    useEffect(() => {
        setAuthFailureHandler(() => {
            setAccessToken(null);
            setUser(null);
            navigateToUrl(getPublicUrl(isDevMode ? '/login' : '/'), true);
        });
    }, []);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const session = await requestRefresh();
                setAccessToken(session.accessToken);
                setUser(session.user);
            } catch {
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = useCallback(async (email, password) => {
        if (!isDevMode) {
            throw 'Login is disabled outside development mode';
        }

        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken: token, user: userData } = response.data.data;

            setAccessToken(token);
            setUser(userData);

            return userData;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
