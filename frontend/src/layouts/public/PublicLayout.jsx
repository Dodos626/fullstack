import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { BasicButton } from '../../components/BasicButton';
import { useAuth } from '../../hooks/useAuth';
import '../Layout.css';
import './PublicLayout.css';

const publicLeftSide = [
    { name: 'Home', destination: '/', type: 'final' },
    { name: 'Login', destination: '/login', type: 'final' },
    {
        name: 'Explore',
        type: 'parent',
        options: [
            { name: 'Landing', destination: '/', type: 'final' },
            { name: 'Login', destination: '/login', type: 'final' },
        ],
    },
];

export const PublicLayout = ({ children }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
        navigate('/', { replace: true });
        await logout();
    };

    const rightSide = () => (
        <div className="navbar-actions">
            {isAuthenticated ? (
                <>
                    <span className="navbar-badge">{user?.role || 'user'}</span>
                    <BasicButton className="navbar-ghost" onClick={handleLogout} type="button">
                        Logout
                    </BasicButton>
                </>
            ) : (
                <BasicButton
                    className="navbar-primary"
                    onClick={() => navigate('/login', { replace: true })}
                    type="button"
                >
                    Login
                </BasicButton>
            )}
        </div>
    );

    return (
        <div className="layout-shell layout-public">
            <Navbar leftSide={publicLeftSide} rightSide={rightSide} />
            <main className="layout-content">{children}</main>
        </div>
    );
};
