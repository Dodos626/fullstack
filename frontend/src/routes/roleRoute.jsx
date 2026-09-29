import { useEffect } from 'react';
import { getPublicUrl, navigateToUrl } from '../config/apps';
import { useAuth } from '../hooks/useAuth';

export const RoleRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const hasAllowedRole = !allowedRoles?.length || allowedRoles.includes(user?.role);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            navigateToUrl(getPublicUrl('/login'), true);
            return;
        }

        if (!hasAllowedRole) {
            navigateToUrl(getPublicUrl('/forbidden'), true);
        }
    }, [hasAllowedRole, isAuthenticated, isLoading]);

    if (isLoading) return <div aria-live="polite">Loading session…</div>;

    if (!isAuthenticated || !hasAllowedRole) {
        return null;
    }

    return children;
};
