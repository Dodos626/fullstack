import { Landing } from '../pages/portfolio/Landing';
import { Login } from '../pages/login/Login';
import { PublicLayout } from '../layouts/public/PublicLayout';
import { Projects } from '../pages/portfolio/subSections/Projects';
import { isDeployment } from '../config/features';

const loginRoute = {
    path: '/login',
    element: (
        <PublicLayout>
            <Login />
        </PublicLayout>
    ),
};

export const publicRoutes = [
    {
        path: '/',
        element: (
            <PublicLayout>
                <Landing />
            </PublicLayout>
        ),
    },
    ...(!isDeployment ? [loginRoute] : []),
    {
        path: '/projects',
        element: (
            <PublicLayout>
                <Projects />
            </PublicLayout>
        ),
    },
];
