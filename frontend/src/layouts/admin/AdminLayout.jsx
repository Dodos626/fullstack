import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/navbar/Navbar';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';
import { useAuth } from '../../hooks/useAuth';
import '../Layout.css';
import './AdminLayout.css';

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
        <div className="navbar-actions">
            <span className="navbar-badge">{user?.role || 'admin'}</span>
            <BasicButton className="navbar-ghost" onClick={handleLogout} type="button">
                Logout
            </BasicButton>
        </div>
    );

    return (
        <div className="layout-shell layout-admin">
            <Navbar leftSide={adminLeftSide} rightSide={rightSide} />
            <main className="layout-content">{children}</main>
        </div>
    );
};
