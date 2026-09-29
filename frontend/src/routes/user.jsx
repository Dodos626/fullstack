import { User } from '../pages/landing/User';
import { UserLayout } from '../layouts/user/UserLayout';
import { RoleRoute } from './roleRoute';

export const userRoutes = [
    {
        path: '/',
        element: (
            <RoleRoute allowedRoles={['user', 'admin']}>
                <UserLayout>
                    <User />
                </UserLayout>
            </RoleRoute>
        ),
    },
];
