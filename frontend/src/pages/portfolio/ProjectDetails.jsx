import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { PageMeta } from '../../components/seo/PageMeta';
import { projects } from '../../data/portfolio';
import styles from './ProjectDetails.module.css';
import { getSeoForPath, NO_INDEX_ROBOTS } from '../../seo/siteMetadata';

export const ProjectDetails = () => {
    const { projectSlug } = useParams();
    const project = projects.find(({ slug }) => slug === projectSlug);

    if (!project) {
        return (
            <section className={styles.notFound}>
                <PageMeta
                    title="Project Not Found — Theodoros Chalkidis"
                    description="The requested software project could not be found."
                    path="/not-found"
                    robots={NO_INDEX_ROBOTS}
                />
                <h1>Project not found</h1>
                <p>The requested project does not exist or its address has changed.</p>
                <Link className={styles.backButton} to="/projects">
                    <FaArrowLeft aria-hidden="true" /> Back to projects
                </Link>
            </section>
        );
    }

    const seo = getSeoForPath(`/projects/${project.slug}`);

    return (
        <article className={styles.page}>
            <PageMeta {...seo} />
            <Link className={styles.backButton} to="/projects">
                <FaArrowLeft aria-hidden="true" /> Back to projects
            </Link>
            <header className={styles.header}>
                <div>
                    <span className={styles.kicker}>Project case study</span>
                    <h1>{project.projectName}</h1>
                    <p>{project.summary}</p>
                </div>
                <div className={styles.headerActions}>
                    {project.liveUrl && (
                        <a
                            className={styles.repositoryButton}
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View live application <FaExternalLinkAlt aria-hidden="true" />
                        </a>
                    )}
                    <a
                        className={styles.repositoryButton}
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaGithub aria-hidden="true" /> View repository
                        <FaExternalLinkAlt aria-hidden="true" />
                    </a>
                </div>
            </header>
            <div className={styles.technologyList} aria-label="Technologies">
                {project.technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                ))}
            </div>
            <section className={styles.contentGrid}>
                <div className={styles.contentPanel}>
                    <h2>More information</h2>
                    {project.details.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
                <aside className={styles.contentPanel}>
                    <h2>Highlights</h2>
                    <ul>
                        {project.highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                        ))}
                    </ul>
                </aside>
            </section>
        </article>
    );
};
