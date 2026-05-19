import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import { genericRoutes } from './generic';
import { publicRoutes } from './public';
import { adminRoutes } from './admin';
import { guestRoutes } from './guest';
import { getLayoutByRole } from '../layouts';

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

    let buildGenericRoute = ({ path, element }) => {
        const Layout = getLayoutByRole(user?.role);

        return <Route key={path} path={path} element={<Layout>{element}</Layout>} />;
    };

    return (
        <Routes>
            {activeRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}

            {genericRoutes.map(buildGenericRoute)}
        </Routes>
    );
};
