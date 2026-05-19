import { Landing } from '../pages/portfolio/Landing';
import { Login } from '../pages/login/Login';
import { PublicLayout } from '../layouts';
import { Projects } from '../pages/portfolio/subSections/Projects';

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
    {
        path: '/projects',
        element: (
            <PublicLayout>
                <Projects />
            </PublicLayout>
        ),
    },
];
