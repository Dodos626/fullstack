import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { PageMeta } from '../../components/seo/PageMeta';
import { AboutContact } from './AboutContact';
import styles from './About.module.css';

export const About = () => {
    return (
        <div className={styles.page}>
            <PageMeta
                title="About — Theodoros Chalkidis"
                description="About Theodoros Chalkidis, a software engineer focused on full-stack products, distributed systems, compilers, and technical ownership."
                path="/about"
            />
            <Link className={styles.backButton} to="/">
                <FaArrowLeft aria-hidden="true" /> Back home
            </Link>
            <header className={styles.header}>
                <span>About</span>
                <h1>Building software with a product mindset and a systems perspective.</h1>
                <p>
                    I am a software engineer based in Heraklion, Greece, working across product
                    development, frontend and backend architecture, distributed processing, and
                    developer infrastructure.
                </p>
            </header>
            <AboutContact />
        </div>
    );
};
