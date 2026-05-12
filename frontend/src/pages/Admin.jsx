import { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import './Admin.css';

export const Admin = () => {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        window.location.href = 'http://lvh.me:5173';
    };

    const handleBackToPortfolio = () => {
        window.location.href = 'http://lvh.me:5173';
    };

    return (
        <div className="admin-container">
            <nav className="admin-navbar">
                <div className="navbar-brand">Admin Panel</div>
                <div className="navbar-buttons">
                    <span className="user-info">{user?.email}</span>
                    <button className="nav-button portfolio-button" onClick={handleBackToPortfolio}>
                        Back to Portfolio
                    </button>
                    <button className="nav-button logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="admin-content">
                <section className="welcome-section">
                    <h1>Welcome to Admin Panel</h1>
                    <p>You have administrative access to manage the application.</p>
                </section>

                <section className="admin-features">
                    <h2>Admin Features (Coming Soon)</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>User Management</h3>
                            <p>Manage users, roles, and permissions</p>
                        </div>
                        <div className="feature-card">
                            <h3>App Management</h3>
                            <p>Configure and manage applications</p>
                        </div>
                        <div className="feature-card">
                            <h3>Analytics</h3>
                            <p>View system analytics and reports</p>
                        </div>
                        <div className="feature-card">
                            <h3>Settings</h3>
                            <p>Configure system-wide settings</p>
                        </div>
                    </div>
                </section>

                <section className="user-role-info">
                    <h2>Your Role: {user?.role?.toUpperCase()}</h2>
                    <p>You have full administrative privileges.</p>
                </section>
            </main>
        </div>
    );
};
