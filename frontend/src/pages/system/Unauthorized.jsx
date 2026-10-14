import styles from './System.module.css';
import { Button } from '../../components/buttons/Button';
import { getPublicUrl, navigateToUrl } from '../../config/apps';
import { PageMeta } from '../../components/seo/PageMeta';
import { getSeoForPath } from '../../seo/siteMetadata';

export const Unauthorized = () => {
    const seo = getSeoForPath('/unauthorized');

    return (
        <div className={styles.systemPage}>
            <PageMeta {...seo} />
            <h1 className={styles.title}>Unauthorized</h1>
            <Button onClick={() => navigateToUrl(getPublicUrl('/'), true)}>Home</Button>
        </div>
    );
};
