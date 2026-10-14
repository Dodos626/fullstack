import styles from './System.module.css';
import { Button } from '../../components/buttons/Button';
import { getPublicUrl, navigateToUrl } from '../../config/apps';
import { PageMeta } from '../../components/seo/PageMeta';
import { getSeoForPath } from '../../seo/siteMetadata';

export const NotAvailable = () => {
    const seo = getSeoForPath('/not-available');

    return (
        <div className={styles.systemPage}>
            <PageMeta {...seo} />
            <h1 className={styles.title}>Not available</h1>
            <Button onClick={() => navigateToUrl(getPublicUrl('/'), true)}>Home</Button>
        </div>
    );
};
