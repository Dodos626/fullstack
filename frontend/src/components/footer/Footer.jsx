import styles from './footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footerBody}>
            <span>© 2026 Theodoros Chalkidis</span>
            <nav className={styles.footerLinks} aria-label="Footer navigation">
                <a href="/projects">Projects</a>
                <a href="/about">About</a>
                <a href="mailto:chlktheo@gmail.com">Contact</a>
            </nav>
        </footer>
    );
};
