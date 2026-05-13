import { Landing } from '../pages/portfolio/Landing';
import { Login } from '../pages/login/Login';
import { PublicLayout } from '../layouts';

export const publicRoutes = [
    {
        path: '/',
        element: (
            <PublicLayout>
                <Landing />
            </PublicLayout>
        ),
    },
    {
        path: '/login',
        element: (
            <PublicLayout>
                <Login />
            </PublicLayout>
        ),
    },
];
