import { Guest } from '../pages/landing/Guest';
import { RoleRoute } from './roleRoute';

export const guestRoutes = [
    {
        path: '/guest',
        element: (
            <RoleRoute allowedRoles={['guest', 'admin']}>
                <Guest />
            </RoleRoute>
        ),
    },
];
