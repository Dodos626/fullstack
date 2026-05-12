import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './auth/AuthProvider';
import { Landing } from './pages/portfolio/Landing';
import { Login } from './pages/login/Login';
import { Admin } from './pages/landing/Admin';
import { Guest } from './pages/landing/Guest';
import { Forbidden } from './pages/system/Forbidden';
import { NotAvailable } from './pages/system/NotAvailable';
import { NotFound } from './pages/system/NotFound';
import { Unauthorized } from './pages/system/Unauthorized';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

const RoleRoute = ({ allowedRoles, children }) => {
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

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route
                path="/admin"
                element={
                    <RoleRoute allowedRoles={['admin']}>
                        <Admin />
                    </RoleRoute>
                }
            />

            <Route
                path="/guest"
                element={
                    <RoleRoute allowedRoles={['guest', 'admin']}>
                        <Guest />
                    </RoleRoute>
                }
            />

            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/not-available" element={<NotAvailable />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
    );
};

export default App;
