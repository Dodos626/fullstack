import { Guest } from '../pages/landing/Guest';
import { GuestLayout } from '../layouts/guest/GuestLayout';
import { RoleRoute } from './roleRoute';

export const guestRoutes = [
    {
        path: '/',
        element: (
            <RoleRoute allowedRoles={['guest', 'admin']}>
                <GuestLayout>
                    <Guest />
                </GuestLayout>
            </RoleRoute>
        ),
    },
];
