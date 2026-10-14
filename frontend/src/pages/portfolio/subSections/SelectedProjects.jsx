import { Link } from 'react-router-dom';
import { SelectedProjectsCard } from './SelectedProjectsCard';
import styles from './subSections.module.css';
import { FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa';
import { projects } from '../../../data/portfolio';

export const selectedProjectsSection = () => {
    const buildProject = ({ slug, projectName, description, technologies, liveUrl }) => {
        return (
            <div className={styles.company} id={`${projectName}`} key={projectName}>
                <div className={styles.companyHeaderRow}>
                    <div className={styles.companyName}>{projectName}</div>
                    <div className={styles.projectHeaderActions}>
                        {liveUrl && (
                            <a
                                className={styles.projectDetailsLink}
                                href={liveUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View live <FaExternalLinkAlt aria-hidden="true" />
                            </a>
                        )}
                        <Link className={styles.projectDetailsLink} to={`/projects/${slug}`}>
                            More <FaArrowRight aria-hidden="true" />
                        </Link>
                    </div>
                </div>
                <div className={styles.projectDescription}>{description}</div>
                <div className={styles.projectTechnologiesContainer}>
                    Technologies:
                    {technologies.map((technology) => {
                        return (
                            <div
                                key={`${projectName}-${technology}`}
                                className={styles.projectTechnologies}
                            >
                                {technology}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return {
        id: 'selected-projects',
        stickySide: 'right',
        title: 'Selected Projects',
        titleClassName: styles.titleBody,
        ratio: [60, 40],
        left: (
            <div className={styles.textBody}>
                {projects.filter((project) => project.selected).map(buildProject)}
                <Link className={styles.seeMore} to="/projects">
                    See More Projects
                </Link>
            </div>
        ),
        right: <SelectedProjectsCard />,
    };
};
