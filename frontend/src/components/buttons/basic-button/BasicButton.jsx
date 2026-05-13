import styles from './BasicButton.module.css';

export const BasicButton = ({
    children,
    className = '',
    style = {},
    onClick,
    type = 'button',
    disabled = false,
}) => {
    return (
        <button
            type={type}
            className={[styles.basicButton, className].filter(Boolean).join(' ')}
            style={style}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
