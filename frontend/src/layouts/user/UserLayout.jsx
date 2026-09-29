import { Navbar } from '../../components/navbar/Navbar';
import { Button } from '../../components/buttons/Button';
import { useAuth } from '../../hooks/useAuth';
import { getPublicUrl, navigateToUrl } from '../../config/apps';
import layoutStyles from '../Layout.module.css';
import styles from './UserLayout.module.css';
import navbarStyles from '../../components/navbar/Navbar.module.css';

const userLeftSide = [
    { name: 'User Home', destination: '/', type: 'final' },
    { name: 'Portfolio', destination: getPublicUrl('/'), type: 'external' },
];

export const UserLayout = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigateToUrl(getPublicUrl('/'), true);
    };

    const rightSide = () => (
        <div className={navbarStyles.navbarActions}>
            <span className={navbarStyles.navbarBadge}>{user?.role || 'user'}</span>
            <Button className={navbarStyles.navbarGhost} onClick={handleLogout}>
                Logout
            </Button>
        </div>
    );

    return (
        <div className={`${layoutStyles.layoutShell} ${styles.layoutUser}`}>
            <Navbar leftSide={userLeftSide} rightSide={rightSide} />
            <main className={`${layoutStyles.layoutContent} ${styles.layoutContent}`}>
                {children}
            </main>
        </div>
    );
};
