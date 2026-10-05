import { FaGithub, FaLinkedin, FaPaperPlane } from 'react-icons/fa';
import styles from './AboutContact.module.css';

export const AboutContact = () => {
    return (
        <section className={styles.section} id="about" aria-labelledby="about-title">
            <article className={styles.panel}>
                <span className={styles.kicker}>About me</span>
                <h2 id="about-title">Engineering from product discovery to production.</h2>
                <p>
                    I enjoy turning ambiguous requirements into practical systems. My work spans
                    product planning, frontend architecture, backend services, distributed data
                    processing, and mentoring engineers.
                </p>
                <p>
                    I am particularly interested in roles where I can combine hands-on engineering
                    with system design, technical ownership, and close collaboration with users and
                    teams.
                </p>
            </article>
            <article className={styles.panel} id="contact">
                <span className={styles.kicker}>Let&apos;s work together</span>
                <h2>Available for software and product-engineering opportunities.</h2>
                <p>
                    Contact me about full-stack platforms, distributed systems, developer tooling,
                    or product-focused engineering work.
                </p>
                <div className={styles.links}>
                    <a href="mailto:chlktheo@gmail.com">
                        <FaPaperPlane aria-hidden="true" /> Email me
                    </a>
                    <a
                        href="https://github.com/dodos626"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaGithub aria-hidden="true" /> GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/theodoros-chalkidis-a76879245/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaLinkedin aria-hidden="true" /> LinkedIn
                    </a>
                </div>
            </article>
        </section>
    );
};
