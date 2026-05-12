import { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import './Guest.css';

export const Guest = () => {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        window.location.href = 'http://lvh.me:5173';
    };

    const handleBackToPortfolio = () => {
        window.location.href = 'http://lvh.me:5173';
    };

    return (
        <div className="guest-container">
            <nav className="guest-navbar">
                <div className="navbar-brand">Guest Panel</div>
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

            <main className="guest-content">
                <section className="welcome-section">
                    <h1>Welcome to Guest Panel</h1>
                    <p>You have guest access to view and interact with available features.</p>
                </section>

                <section className="guest-features">
                    <h2>Guest Features (Coming Soon)</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>View Content</h3>
                            <p>Access publicly available content and resources</p>
                        </div>
                        <div className="feature-card">
                            <h3>Shared Apps</h3>
                            <p>Access shared applications and services</p>
                        </div>
                        <div className="feature-card">
                            <h3>Collaboration</h3>
                            <p>Collaborate with other users on shared projects</p>
                        </div>
                        <div className="feature-card">
                            <h3>Profile</h3>
                            <p>Manage your guest profile and preferences</p>
                        </div>
                    </div>
                </section>

                <section className="user-role-info">
                    <h2>Your Role: {user?.role?.toUpperCase()}</h2>
                    <p>You have guest-level access to the platform.</p>
                </section>
            </main>
        </div>
    );
};
