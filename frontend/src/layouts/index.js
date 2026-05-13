export { PublicLayout } from './public/PublicLayout';
export { AdminLayout } from './admin/AdminLayout';
export { GuestLayout } from './guest/GuestLayout';

export const getLayoutByRole = (role) => {
    if (role === 'admin') {
        return AdminLayout;
    }
    if (role === 'guest') {
        return GuestLayout;
    }
    return PublicLayout;
};
