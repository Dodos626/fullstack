import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';

export const RoleRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, user, isLoading } = useContext(AuthContext);

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/forbidden" replace />;
    }

    if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
};
