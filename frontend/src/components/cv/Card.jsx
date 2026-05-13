import styles from './Card.module.css';

export const Card = ({ header, title, subtitle, content, footer, children, className = '' }) => {
    return (
        <article className={[styles.card, className].filter(Boolean).join(' ')}>
            {header ? <div className={styles.header}>{header}</div> : null}
            {title ? <h3 className={styles.title}>{title}</h3> : null}
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            {content ? <div className={styles.content}>{content}</div> : null}
            {children}
            {footer ? <div className={styles.footer}>{footer}</div> : null}
        </article>
    );
};
