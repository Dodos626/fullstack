import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/navbar/Navbar';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';
import { useAuth } from '../../hooks/useAuth';
import layoutStyles from '../Layout.module.css';
import styles from './AdminLayout.module.css';
import navbarStyles from '../../components/navbar/Navbar.module.css';

const adminLeftSide = [
    { name: 'Admin', destination: '/admin', type: 'final' },
    {
        name: 'Access',
        type: 'parent',
        options: [
            { name: 'Guest', destination: '/guest', type: 'final' },
            { name: 'Home', destination: '/', type: 'final' },
        ],
    },
];

export const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        navigate('/', { replace: true });
        await logout();
    };

    const rightSide = () => (
        <div className={navbarStyles.navbarActions}>
            <span className={navbarStyles.navbarBadge}>{user?.role || 'admin'}</span>
            <BasicButton className={navbarStyles.navbarGhost} onClick={handleLogout} type="button">
                Logout
            </BasicButton>
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
