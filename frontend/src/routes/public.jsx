import { Landing } from '../pages/portfolio/Landing';
import { Login } from '../pages/login/Login';
import { PublicLayout } from '../layouts/public/PublicLayout';
import { Projects } from '../pages/portfolio/subSections/Projects';
import { ProjectDetails } from '../pages/portfolio/ProjectDetails';
import { About } from '../pages/portfolio/About';
import { isDevMode } from '../config/features';

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
    ...(isDevMode ? [loginRoute] : []),
    {
        path: '/about',
        element: (
            <PublicLayout>
                <About />
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
    {
        path: '/projects/:projectSlug',
        element: (
            <PublicLayout>
                <ProjectDetails />
            </PublicLayout>
        ),
    },
];
