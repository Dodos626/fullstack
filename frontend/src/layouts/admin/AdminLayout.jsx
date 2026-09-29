import { Navbar } from '../../components/navbar/Navbar';
import { Button } from '../../components/buttons/Button';
import { useAuth } from '../../hooks/useAuth';
import layoutStyles from '../Layout.module.css';
import styles from './AdminLayout.module.css';
import navbarStyles from '../../components/navbar/Navbar.module.css';
import { buildUrl, getPublicUrl, navigateToUrl } from '../../config/apps';

const adminLeftSide = [
    { name: 'Admin', destination: '/', type: 'final' },
    {
        name: 'Access',
        type: 'parent',
        options: [
            { name: 'User App', destination: buildUrl('user', '/'), type: 'external' },
            { name: 'Guest App', destination: buildUrl('guest', '/'), type: 'external' },
            { name: 'Portfolio', destination: getPublicUrl('/'), type: 'external' },
        ],
    },
];

export const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigateToUrl(getPublicUrl('/'), true);
    };

    const rightSide = () => (
        <div className={navbarStyles.navbarActions}>
            <span className={navbarStyles.navbarBadge}>{user?.role || 'admin'}</span>
            <Button className={navbarStyles.navbarGhost} onClick={handleLogout} type="button">
                Logout
            </Button>
        </div>
    );

    return (
        <div className={`${layoutStyles.layoutShell} ${styles.layoutAdmin}`}>
            <Navbar leftSide={adminLeftSide} rightSide={rightSide} />
            <main className={`${layoutStyles.layoutContent} ${styles.layoutContent}`}>
                {children}
            </main>
        </div>
    );
};
