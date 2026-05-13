import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';
import styles from './Landing.module.css';

export const Landing = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const go = (path) => {
        navigate(path, { replace: true });
    };

    return (
        <div className={styles.landing}>
            <h1>Landing</h1>
            {isAuthenticated ? (
                <div className={styles.actions}>
                    {user?.role === 'admin' && (
                        <BasicButton onClick={() => go('/admin')}>admin</BasicButton>
                    )}
                    {user?.role === 'guest' && (
                        <BasicButton onClick={() => go('/guest')}>guest</BasicButton>
                    )}
                    <BasicButton onClick={() => go('/')}>home</BasicButton>
                    <BasicButton onClick={() => go('/login')}>login</BasicButton>
                </div>
            ) : (
                <div className={styles.actions}>
                    <BasicButton onClick={() => go('/login')}>login</BasicButton>
                    <BasicButton onClick={() => go('/')}>home</BasicButton>
                </div>
            )}
        </div>
    );
};
