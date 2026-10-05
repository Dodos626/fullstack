import { Link } from 'react-router-dom';
import { FaArrowRight, FaDownload, FaEnvelope } from 'react-icons/fa';
import styles from './Hero.module.css';

const CV_URL = '/Chalkidis%20Theodoros%20CV.pdf';

export const Hero = () => {
    return (
        <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroCopy}>
                <div className={styles.eyebrow}>Software Engineer · Heraklion, Greece · Remote</div>
                <h1 id="hero-title" className={styles.title}>
                    I build reliable full-stack products and systems that scale.
                </h1>
                <p className={styles.summary}>
                    I work across React applications, backend services, distributed systems,
                    compilers, and graphics programming—with an emphasis on clear architecture and
                    maintainable software.
                </p>
                <div className={styles.actions}>
                    <Link
                        className={`${styles.action} ${styles.primaryAction}`}
                        to="/projects"
                    >
                        View projects <FaArrowRight aria-hidden="true" />
                    </Link>
                    <a
                        className={styles.action}
                        href={CV_URL}
                        download
                    >
                        Download CV <FaDownload aria-hidden="true" />
                    </a>
                    <a
                        className={styles.action}
                        href="mailto:chlktheo@gmail.com"
                    >
                        Contact me <FaEnvelope aria-hidden="true" />
                    </a>
                </div>
            </div>
            <aside className={styles.snapshot} aria-label="Professional focus">
                <span className={styles.snapshotLabel}>Current focus</span>
                <strong>Product engineering and platform architecture</strong>
                <p>
                    Building end-to-end products, reusable infrastructure, and dependable systems
                    for teams and clients.
                </p>
                <div className={styles.focusTags}>
                    <span>React</span>
                    <span>Node.js</span>
                    <span>Distributed systems</span>
                    <span>Developer tooling</span>
                </div>
            </aside>
        </section>
    );
};
