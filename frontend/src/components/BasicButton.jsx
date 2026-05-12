import './BasicButton.css';

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
            className={`basic-button ${className}`.trim()}
            style={style}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
