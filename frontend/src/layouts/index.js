import { PublicLayout } from './public/PublicLayout';
import { AdminLayout } from './admin/AdminLayout';
import { GuestLayout } from './guest/GuestLayout';

export { PublicLayout, AdminLayout, GuestLayout };

export const getLayoutByRole = (role) => {
    if (role === 'admin') {
        return AdminLayout;
    }
    if (role === 'guest') {
        return GuestLayout;
    }
    return PublicLayout;
};
