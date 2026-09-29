import { Navbar } from '../../components/navbar/Navbar';
import { Button } from '../../components/buttons/Button';
import { useAuth } from '../../hooks/useAuth';
import layoutStyles from '../Layout.module.css';
import styles from './GuestLayout.module.css';
import navbarStyles from '../../components/navbar/Navbar.module.css';
import { buildUrl, getPublicUrl, navigateToUrl } from '../../config/apps';

const guestLeftSide = [
    { name: 'Guest', destination: '/', type: 'final' },
    {
        name: 'Navigate',
        type: 'parent',
        options: [
            { name: 'User App', destination: buildUrl('user', '/'), type: 'external' },
            { name: 'Portfolio', destination: getPublicUrl('/'), type: 'external' },
        ],
    },
];

export const GuestLayout = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigateToUrl(getPublicUrl('/'), true);
    };

    const rightSide = () => (
        <div className={navbarStyles.navbarActions}>
            <span className={navbarStyles.navbarBadge}>{user?.role || 'guest'}</span>
            <Button className={navbarStyles.navbarGhost} onClick={handleLogout} type="button">
                Logout
            </Button>
        </div>
    );

    return (
        <div className={`${layoutStyles.layoutShell} ${styles.layoutGuest}`}>
            <Navbar leftSide={guestLeftSide} rightSide={rightSide} />
            <main className={`${layoutStyles.layoutContent} ${styles.layoutContent}`}>
                {children}
            </main>
        </div>
    );
};
