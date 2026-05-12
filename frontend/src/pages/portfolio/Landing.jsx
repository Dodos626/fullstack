import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider';
import './Landing.css';

export const Landing = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const go = (path) => {
        navigate(path, { replace: true });
    };

    return (
        <div className="landing">
            <h1>Landing</h1>
            {isAuthenticated ? (
                <div className="actions">
                    {user?.role === 'admin' && <button onClick={() => go('/admin')}>admin</button>}
                    {user?.role === 'guest' && <button onClick={() => go('/guest')}>guest</button>}
                </div>
            ) : (
                <div className="actions">
                    <button onClick={() => go('/login')}>
                        login
                    </button>
                </div>
            )}
        </div>
    );
};
