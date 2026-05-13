import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../hooks/useAuth';
import '../Layout.css';
import './GuestLayout.css';

const guestLeftSide = [
    { name: 'Guest', destination: '/guest', type: 'final' },
    {
        name: 'Navigate',
        type: 'parent',
        options: [
            { name: 'Home', destination: '/', type: 'final' },
            { name: 'Admin', destination: '/admin', type: 'final' },
        ],
    },
];

export const GuestLayout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        navigate('/', { replace: true });
        await logout();
    };

    const rightSide = () => (
        <div className="navbar-actions">
            <span className="navbar-badge">{user?.role || 'guest'}</span>
            <button className="navbar-ghost" onClick={handleLogout} type="button">
                Logout
            </button>
        </div>
    );

    return (
        <div className="layout-shell layout-guest">
            <Navbar leftSide={guestLeftSide} rightSide={rightSide} />
            <main className="layout-content">{children}</main>
        </div>
    );
};
