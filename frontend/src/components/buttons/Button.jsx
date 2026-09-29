import styles from './Button.module.css';

export const Button = ({
    children,
    className = '',
    onClick,
    type = 'button',
    disabled = false,
    active = false,
    pressed,
    variant = 'default',
    ...buttonProps
}) => {
    const isPressed = pressed ?? active;
    const hasPressedState = pressed !== undefined || active;

    return (
        <button
            {...buttonProps}
            type={type}
            className={[styles.button, styles[variant], isPressed ? styles.active : null, className]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
            disabled={disabled}
            aria-pressed={hasPressedState ? isPressed : undefined}
        >
            {children}
        </button>
    );
};
