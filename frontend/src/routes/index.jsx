import { Routes, Route } from 'react-router-dom';
import { genericRoutes } from './generic';
import { publicRoutes } from './public';
import { adminRoutes } from './admin';
import { guestRoutes } from './guest';
import { userRoutes } from './user';
import { getCurrentApp } from '../config/apps';

const routesByApp = {
    public: publicRoutes,
    admin: adminRoutes,
    guest: guestRoutes,
    user: userRoutes,
};

export const AppRoutes = () => {
    const currentApp = getCurrentApp();
    const activeRoutes = routesByApp[currentApp] || [];

    return (
        <Routes>
            {activeRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}

            {genericRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}
        </Routes>
    );
};
