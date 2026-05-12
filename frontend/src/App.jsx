import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './router/ProtectedRoute';
import { Login } from './pages/Login';
import { Portfolio } from './pages/Portfolio';
import { Admin } from './pages/Admin';
import { Guest } from './pages/Guest';
import { Unauthorized } from './pages/Unauthorized';
import './App.css';

function App() {
    const subdomain = getSubdomain();

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Login page (available on all subdomains) */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Route based on subdomain */}
                    {subdomain === 'admin' ? (
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <Admin />
                                </ProtectedRoute>
                            }
                        />
                    ) : subdomain === 'guest' ? (
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute allowedRoles={['guest', 'admin']}>
                                    <Guest />
                                </ProtectedRoute>
                            }
                        />
                    ) : (
                        /* Default portfolio (main domain) */
                        <Route path="/" element={<Portfolio />} />
                    )}

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

function getSubdomain() {
    const host = window.location.hostname;
    const parts = host.split('.');

    if (parts.length > 2) {
        return parts[0];
    }

    return null;
}

export default App;
