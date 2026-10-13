import { FaArrowRight } from 'react-icons/fa';
import { PageMeta } from '../../components/seo/PageMeta';
import { subApps } from '../../config/subApps';
import styles from './Apps.module.css';

export const Apps = () => {
    return (
        <section className={styles.page}>
            <PageMeta
                title="Apps — Theodoros Chalkidis"
                description="A collection of standalone web applications built by Theodoros Chalkidis."
                path="/apps"
            />

            <header className={styles.header}>
                <span className={styles.kicker}>App collection</span>
                <h1>Explore the apps</h1>
                <p>
                    Each app is an independent project with its own subdomain and source folder.
                </p>
            </header>

            <div className={styles.grid}>
                {subApps.map((app) => (
                    <article className={styles.card} key={app.id}>
                        <div className={styles.cardHeader}>
                            <span className={styles.status}>Available</span>
                            <span className={styles.host}>{app.host}</span>
                        </div>
                        <h2>{app.name}</h2>
                        <p>{app.description}</p>
                        <a className={styles.openButton} href={app.url}>
                            Open app <FaArrowRight aria-hidden="true" />
                        </a>
                    </article>
                ))}
            </div>
        </section>
    );
};