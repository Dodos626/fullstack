import { Button } from '../../components/buttons/Button';
import { getPublicUrl, navigateToUrl } from '../../config/apps';
import styles from './Landing.module.css';

export const User = () => {
    return (
        <section className={styles.landingPage}>
            <h1 className={styles.title}>User application</h1>
            <p>Your authenticated user workspace is ready for future applications.</p>
            <Button onClick={() => navigateToUrl(getPublicUrl('/'))}>Portfolio</Button>
        </section>
    );
};
