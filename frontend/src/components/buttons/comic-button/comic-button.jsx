import styles from './comic-button.module.css';

export const ComicButton = ({
    children,
    className = '',
    style = {},
    onClick,
    type = 'button',
    disabled = false,
    isActive = false,
}) => {
    return (
        <button
            type={type}
            className={[styles.basicButton, isActive ? styles.isActive : null, className]
                .filter(Boolean)
                .join(' ')}
            style={style}
            onClick={onClick}
            disabled={disabled}
        >
            <span className={styles.button_top}>{children}</span>
        </button>
    );
};
