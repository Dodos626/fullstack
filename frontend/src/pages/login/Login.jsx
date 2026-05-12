import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider';
import './Login.css';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const go = (path) => {
        navigate(path, { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);

            if (user.role === 'admin') {
                go('/admin');
            } else if (user.role === 'guest') {
                go('/guest');
            } else {
                go('/');
            }
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                />
                {error && <div className="error">{error}</div>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? '...' : 'Login'}
                </button>
            </form>
        </div>
    );
};
