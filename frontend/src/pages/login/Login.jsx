import { useState } from 'react';
import { Button } from '../../components/buttons/Button';
import { useAuth } from '../../hooks/useAuth';
import { getPublicUrl, getRoleHomeUrl, navigateToUrl } from '../../config/apps';
import styles from './Login.module.css';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);

            navigateToUrl(getRoleHomeUrl(user.role), true);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.login}>
                <h1 id="login-title">Login</h1>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        aria-describedby={error ? 'login-error' : undefined}
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        minLength={8}
                        aria-describedby={error ? 'login-error' : undefined}
                    />
                    {error && (
                        <div id="login-error" className={styles.error} role="alert">
                            {error}
                        </div>
                    )}
                    <div className={styles.loginActions}>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing in…' : 'Login'}
                        </Button>
                        <Button onClick={() => navigateToUrl(getPublicUrl('/'))}>Home</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
