import { Button } from './Button';
import styles from './IconButton.module.css';

export const IconButton = ({ children, className = '', ...props }) => {
    return (
        <Button
            {...props}
            variant="unstyled"
            className={[styles.iconButton, className].filter(Boolean).join(' ')}
        >
            {children}
        </Button>
    );
};
