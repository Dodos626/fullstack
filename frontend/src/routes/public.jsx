import { Landing } from '../pages/portfolio/Landing';
import { Login } from '../pages/login/Login';

export const publicRoutes = [
    { path: '/', element: <Landing /> },
    { path: '/login', element: <Login /> },
];
