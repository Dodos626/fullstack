import { Guest } from '../pages/landing/Guest';
import { GuestLayout } from '../layouts';
import { RoleRoute } from './roleRoute';

export const guestRoutes = [
    {
        path: '/guest',
        element: (
            <RoleRoute allowedRoles={['guest', 'admin']}>
                <GuestLayout>
                    <Guest />
                </GuestLayout>
            </RoleRoute>
        ),
    },
];
