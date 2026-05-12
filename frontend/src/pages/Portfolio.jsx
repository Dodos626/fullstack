import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import './Portfolio.css';

export const Portfolio = () => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        window.location.href = 'http://lvh.me:5173';
    };

    const handleAdminPanel = () => {
        window.location.href = 'http://admin.lvh.me:5173';
    };

    const handleGuestPanel = () => {
        window.location.href = 'http://guest.lvh.me:5173';
    };

    return (
        <div className="portfolio-container">
            <nav className="navbar">
                <div className="navbar-brand">My Portfolio</div>
                <div className="navbar-buttons">
                    {isAuthenticated ? (
                        <>
                            <span className="user-info">
                                {user?.email} ({user?.role})
                            </span>
                            {user?.role === 'admin' && (
                                <button
                                    className="nav-button admin-button"
                                    onClick={handleAdminPanel}
                                >
                                    Admin Panel
                                </button>
                            )}
                            {user?.role === 'guest' && (
                                <button
                                    className="nav-button guest-button"
                                    onClick={handleGuestPanel}
                                >
                                    Guest Panel
                                </button>
                            )}
                            <button className="nav-button logout-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            className="nav-button login-button"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    )}
                </div>
            </nav>

            <main className="portfolio-content">
                <section className="hero">
                    <h1>Welcome to My Portfolio</h1>
                    <p>This is a placeholder for your CV and portfolio content.</p>
                </section>

                <section className="info">
                    <h2>About This App</h2>
                    <p>This fullstack application demonstrates a multi-app architecture with:</p>
                    <ul>
                        <li>Admin panel (admin.localhost)</li>
                        <li>Guest panel (guest.localhost)</li>
                        <li>Main portfolio (localhost) - this page</li>
                        <li>Future extensibility for other apps (notes.localhost, etc)</li>
                    </ul>
                </section>
            </main>
        </div>
    );
};
