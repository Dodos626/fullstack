import styles from './System.module.css';
import { Button } from '../../components/buttons/Button';
import { getPublicUrl, navigateToUrl } from '../../config/apps';

export const NotFound = () => {
    return (
        <div className={styles.systemPage}>
            <h1 className={styles.title}>Not found</h1>
            <Button onClick={() => navigateToUrl(getPublicUrl('/'), true)}>Home</Button>
        </div>
    );
};
