import styles from './System.module.css';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';

export const Unauthorized = () => {
    return (
        <div className={styles.systemPage}>
            <div className={styles.title}>unauthorized</div>
            <BasicButton onClick={() => window.location.replace('/')}>home</BasicButton>
        </div>
    );
};
