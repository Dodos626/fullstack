import { Admin } from '../pages/landing/Admin';
import { RoleRoute } from './roleRoute';

export const adminRoutes = [
    {
        path: '/admin',
        element: (
            <RoleRoute allowedRoles={['admin']}>
                <Admin />
            </RoleRoute>
        ),
    },
];
