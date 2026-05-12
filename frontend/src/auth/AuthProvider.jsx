import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [isLoading, setIsLoading] = useState(true);

    // Set authorization header when token changes
    useEffect(() => {
        if (accessToken) {
            api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
            localStorage.setItem('accessToken', accessToken);
        } else {
            delete api.defaults.headers.common.Authorization;
            localStorage.removeItem('accessToken');
        }
    }, [accessToken]);

    // Try to restore session from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && accessToken) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, [accessToken]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken: token, user: userData } = response.data.data;

            setAccessToken(token);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('accessToken', token);

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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
    }, []);

    const value = {
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
