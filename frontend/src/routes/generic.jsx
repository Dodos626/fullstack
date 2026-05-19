import { Routes, Route, Navigate } from 'react-router-dom';
import { Forbidden } from '../pages/system/Forbidden';
import { NotAvailable } from '../pages/system/NotAvailable';
import { NotFound } from '../pages/system/NotFound';
import { Unauthorized } from '../pages/system/Unauthorized';

export const genericRoutes = [
    { path: '/forbidden', element: <Forbidden /> },
    { path: '/not-available', element: <NotAvailable /> },
    { path: '/unauthorized', element: <Unauthorized /> },
    { path: '/not-found', element: <NotFound /> },
    { path: '*', element: <Navigate to="/not-found" replace /> },
];
