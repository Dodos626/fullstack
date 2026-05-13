import { Admin } from '../pages/landing/Admin';
import { AdminLayout } from '../layouts';
import { RoleRoute } from './roleRoute';

export const adminRoutes = [
    {
        path: '/admin',
        element: (
            <RoleRoute allowedRoles={['admin']}>
                <AdminLayout>
                    <Admin />
                </AdminLayout>
            </RoleRoute>
        ),
    },
];
