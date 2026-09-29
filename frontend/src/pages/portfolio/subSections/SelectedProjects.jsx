import { openInNewTab } from '../../../utils/utils';
import { SelectedProjectsCard } from './SelectedProjectsCard';
import styles from './subSections.module.css';
import { FaGithub } from 'react-icons/fa';
import { projects } from '../../../data/portfolio';
import { IconButton } from '../../../components/buttons/IconButton';

export const selectedProjectsSection = () => {
    const buildProject = ({ projectName, description, technologies, github }) => {
        return (
            <div className={styles.company} id={`${projectName}`} key={projectName}>
                <div className={styles.companyHeaderRow}>
                    <div className={styles.companyName}>{projectName}</div>
                    <IconButton
                        type="button"
                        aria-label={`Open ${projectName} on GitHub`}
                        className={styles.companyYears}
                        onClick={() => {
                            openInNewTab(github);
                        }}
                    >
                        <FaGithub size={25} />
                    </IconButton>
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
                <a className={styles.seeMore} href="/projects">
                    See More Projects
                </a>
            </div>
        ),
        right: <SelectedProjectsCard />,
    };
};
