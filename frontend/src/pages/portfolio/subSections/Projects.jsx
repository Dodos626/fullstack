import { useEffect, useState } from 'react';
import styles from './subSections.module.css';
import { FaGithub } from 'react-icons/fa';
import { FilterTable } from '../../../components/table/FilterTable';
import { projects } from '../../../data/portfolio';
import { openInNewTab } from '../../../utils/utils';
import { IconButton } from '../../../components/buttons/IconButton';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { PageMeta } from '../../../components/seo/PageMeta';

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
            width: 'minmax(0, 20fr)',
            render: (project) => (
                <div className={styles.companyHeaderRow}>
                    <div className={`${styles.companyName} ${styles.projectTableName}`}>
                        {project.projectName}
                    </div>
                </div>
            ),
        },
        {
            header: 'Description',
            key: 'description',
            width: 'minmax(0, 46fr)',
            render: (project) => (
                <div
                    className={`${styles.projectDescription} ${styles.projectTableDescription}`}
                >
                    {project.description}
                </div>
            ),
        },
        {
            header: 'Technologies',
            key: 'technologies',
            width: 'minmax(0, 20fr)',
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
            header: null,
            key: 'actions',
            width: 'minmax(144px, 14fr)',
            render: (project) => (
                <div className={styles.projectActions}>
                    <IconButton
                        type="button"
                        aria-label={`Open ${project.projectName} on GitHub`}
                        title={`Open ${project.projectName} on GitHub`}
                        className={`${styles.companyYears} ${styles.projectActionButton}`}
                        onClick={() => openInNewTab(project.github)}
                    >
                        <FaGithub size={26} aria-hidden="true" />
                    </IconButton>
                    <Link
                        className={`${styles.projectDetailsLink} ${styles.projectActionButton}`}
                        to={`/projects/${project.slug}`}
                    >
                        More <FaArrowRight aria-hidden="true" />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageMeta
                title="Projects — Theodoros Chalkidis"
                description="Software projects by Theodoros Chalkidis across full-stack development, distributed systems, compilers, databases, and graphics programming."
                path="/projects"
            />
            <h1 className={styles.titlePage}>Projects</h1>

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
