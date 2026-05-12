import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import { Forbidden } from '../pages/system/Forbidden';
import { NotAvailable } from '../pages/system/NotAvailable';
import { NotFound } from '../pages/system/NotFound';
import { Unauthorized } from '../pages/system/Unauthorized';
import { publicRoutes } from './public';
import { adminRoutes } from './admin';
import { guestRoutes } from './guest';

export const AppRoutes = () => {
    const { isAuthenticated, user, isLoading } = useContext(AuthContext);

    const activeRoutes = [...publicRoutes];

    if (!isLoading && isAuthenticated) {
        if (user?.role === 'admin') {
            activeRoutes.push(...adminRoutes, ...guestRoutes);
        }
        if (user?.role === 'guest') {
            activeRoutes.push(...guestRoutes);
        }
    }

    return (
        <Routes>
            {activeRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}

            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/not-available" element={<NotAvailable />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
    );
};
