import { Admin } from '../pages/landing/Admin';
import { AdminLayout } from '../layouts/admin/AdminLayout';
import { RoleRoute } from './roleRoute';

export const adminRoutes = [
    {
        path: '/',
        element: (
            <RoleRoute allowedRoles={['admin']}>
                <AdminLayout>
                    <Admin />
                </AdminLayout>
            </RoleRoute>
        ),
    },
];
