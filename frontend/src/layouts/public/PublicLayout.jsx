import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/navbar/Navbar';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';
import { useAuth } from '../../hooks/useAuth';
import layoutStyles from '../Layout.module.css';
import styles from './PublicLayout.module.css';
import navbarStyles from '../../components/navbar/Navbar.module.css';

const publicLeftSide = [
    { name: 'Home', destination: '/', type: 'final' },
    { name: 'Login', destination: '/login', type: 'final' },
    { name: 'test', destination: '/test', type: 'final' },
    {
        name: 'Explore',
        type: 'parent',
        options: [
            { name: 'Landing', destination: '/', type: 'final' },
            { name: 'Login', destination: '/login', type: 'final' },
        ],
    },
    {
        name: 'Explore2',
        type: 'parent',
        options: [
            { name: 'test2', destination: '/test2', type: 'final' },
            {
                name: 'Explore',
                type: 'parent',
                options: [
                    { name: 'Landing', destination: '/', type: 'final' },
                    { name: 'Login', destination: '/login', type: 'final' },
                ],
            },
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
        <div className={navbarStyles.navbarActions}>
            {isAuthenticated ? (
                <>
                    <span className={navbarStyles.navbarBadge}>{user?.role || 'user'}</span>
                    <BasicButton
                        className={navbarStyles.navbarGhost}
                        onClick={handleLogout}
                        type="button"
                    >
                        Logout
                    </BasicButton>
                </>
            ) : (
                <BasicButton
                    className={navbarStyles.navbarPrimary}
                    onClick={() => navigate('/login', { replace: true })}
                    type="button"
                >
                    Login
                </BasicButton>
            )}
        </div>
    );

    return (
        <div className={`${layoutStyles.layoutShell} ${styles.layoutPublic}`}>
            <Navbar leftSide={publicLeftSide} rightSide={rightSide} />
            <main className={`${layoutStyles.layoutContent} ${styles.layoutContent}`}>
                {children}
            </main>
        </div>
    );
};
