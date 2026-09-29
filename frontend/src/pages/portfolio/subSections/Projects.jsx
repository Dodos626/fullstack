import styles from './subSections.module.css';
import { FaGithub } from 'react-icons/fa';
import { FilterTable } from '../../../components/table/FilterTable';
import { projects } from '../../../data/portfolio';
import { openInNewTab } from '../../../utils/utils';
import { IconButton } from '../../../components/buttons/IconButton';

export const Projects = () => {
    const columns = [
        {
            header: 'Project',
            key: 'projectName',
            width: '20%',
            render: (project) => (
                <div className={styles.companyHeaderRow}>
                    <div className={styles.companyName}>{project.projectName}</div>
                </div>
            ),
        },
        {
            header: 'Description',
            key: 'description',
            width: '50%',
            render: (project) => (
                <div className={styles.projectDescription}>{project.description}</div>
            ),
        },
        {
            header: 'Technologies',
            key: 'technologies',
            width: '20%',
            render: (project) => (
                <div className={styles.projectTechnologiesContainer}>
                    {project.technologies.map((technology) => (
                        <span
                            key={`${project.projectName}-${technology}`}
                            className={styles.projectTechnologies}
                        >
                            {technology}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            header: 'Link',
            key: 'github',
            width: '5%',
            sticky: 'right',
            render: (project) => (
                <IconButton
                    type="button"
                    className={styles.companyYears}
                    onClick={() => openInNewTab(project.github)}
                >
                    <FaGithub size={30} />
                </IconButton>
            ),
        },
    ];

    return (
        <div>
            <div className={styles.titlePage}>Projects</div>

            <div className={styles.textBody}>
                <FilterTable
                    columns={columns}
                    rows={projects}
                    rowKey="projectName"
                    tagsKey="technologies"
                    pageSize={4}
                />
            </div>
        </div>
    );
};
