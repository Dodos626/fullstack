import styles from './Landing.module.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../auth/AuthProvider';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';

export const Guest = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const go = (path) => {
        navigate(path, { replace: true });
    };

    const handleLogout = async () => {
        // Navigate to landing immediately to avoid not-found after auth state clears
        go('/');
        await logout();
    };

    return (
        <div className={styles.landingPage}>
            <div className={styles.title}>guest</div>
            <BasicButton onClick={handleLogout}>logout</BasicButton>
            <BasicButton onClick={() => go('/')}>home</BasicButton>
        </div>
    );
};
