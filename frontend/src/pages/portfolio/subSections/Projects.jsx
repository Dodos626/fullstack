import { useEffect, useState } from 'react';
import styles from './subSections.module.css';
import { FaGithub } from 'react-icons/fa';
import { FilterTable } from '../../../components/table/FilterTable';
import { projects } from '../../../data/portfolio';
import { openInNewTab } from '../../../utils/utils';
import { IconButton } from '../../../components/buttons/IconButton';

const MIN_PROJECTS_PER_PAGE = 4;
const PROJECTS_TABLE_VERTICAL_OFFSET = 320;
const ESTIMATED_PROJECT_ROW_HEIGHT = 135;

const getProjectsPageSize = () => {
    if (typeof window === 'undefined') {
        return MIN_PROJECTS_PER_PAGE;
    }

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const availableHeight = Math.max(0, viewportHeight - PROJECTS_TABLE_VERTICAL_OFFSET);
    const visibleRows = Math.floor(availableHeight / ESTIMATED_PROJECT_ROW_HEIGHT);

    return Math.min(projects.length, Math.max(MIN_PROJECTS_PER_PAGE, visibleRows));
};

export const Projects = () => {
    const [pageSize, setPageSize] = useState(getProjectsPageSize);

    useEffect(() => {
        const updatePageSize = () => setPageSize(getProjectsPageSize());

        window.addEventListener('resize', updatePageSize);
        window.visualViewport?.addEventListener('resize', updatePageSize);

        return () => {
            window.removeEventListener('resize', updatePageSize);
            window.visualViewport?.removeEventListener('resize', updatePageSize);
        };
    }, []);

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
                    pageSize={pageSize}
                />
            </div>
        </div>
    );
};
