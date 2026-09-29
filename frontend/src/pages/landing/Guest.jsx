import styles from './Landing.module.css';
import { Button } from '../../components/buttons/Button';
import { getPublicUrl, navigateToUrl } from '../../config/apps';

export const Guest = () => {
    return (
        <section className={styles.landingPage}>
            <h1 className={styles.title}>Guest application</h1>
            <p>This area demonstrates a restricted application for guest accounts.</p>
            <Button onClick={() => navigateToUrl(getPublicUrl('/'))}>Portfolio</Button>
        </section>
    );
};
