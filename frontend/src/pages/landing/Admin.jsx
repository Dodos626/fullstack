import styles from './Landing.module.css';
import { Button } from '../../components/buttons/Button';
import { buildUrl, getPublicUrl, navigateToUrl } from '../../config/apps';

export const Admin = () => {
    return (
        <section className={styles.landingPage}>
            <h1 className={styles.title}>Admin application</h1>
            <p>Manage platform features and access the role-specific applications.</p>
            <Button onClick={() => navigateToUrl(buildUrl('user', '/'))}>User app</Button>
            <Button onClick={() => navigateToUrl(buildUrl('guest', '/'))}>Guest app</Button>
            <Button onClick={() => navigateToUrl(getPublicUrl('/'))}>Portfolio</Button>
        </section>
    );
};
