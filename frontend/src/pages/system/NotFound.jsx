import styles from './System.module.css';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';

export const NotFound = () => {
    return (
        <div className={styles.systemPage}>
            <div className={styles.title}>not found</div>
            <BasicButton onClick={() => window.location.replace('/')}>home</BasicButton>
        </div>
    );
};
