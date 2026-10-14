import { useEffect, useState } from 'react';
import styles from './subSections.module.css';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { FilterTable } from '../../../components/table/FilterTable';
import { projects } from '../../../data/portfolio';
import { openInNewTab } from '../../../utils/utils';
import { IconButton } from '../../../components/buttons/IconButton';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { PageMeta } from '../../../components/seo/PageMeta';
import { getSeoForPath } from '../../../seo/siteMetadata';

const MIN_PROJECTS_PER_PAGE = 4;
const PROJECTS_TABLE_VERTICAL_OFFSET = 320;
const ESTIMATED_PROJECT_ROW_HEIGHT = 135;

const getProjectsPageSize = () => {
    if (typeof window === 'undefined') {
        return projects.length;
    }

    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const availableHeight = Math.max(0, viewportHeight - PROJECTS_TABLE_VERTICAL_OFFSET);
    const visibleRows = Math.floor(availableHeight / ESTIMATED_PROJECT_ROW_HEIGHT);

    return Math.min(projects.length, Math.max(MIN_PROJECTS_PER_PAGE, visibleRows));
};

export const Projects = () => {
    const [pageSize, setPageSize] = useState(projects.length);
    const seo = getSeoForPath('/projects');

    useEffect(() => {
        const updatePageSize = () => setPageSize(getProjectsPageSize());

        const initialPageSizeTimer = window.setTimeout(updatePageSize, 0);
        window.addEventListener('resize', updatePageSize);
        window.visualViewport?.addEventListener('resize', updatePageSize);

        return () => {
            window.clearTimeout(initialPageSizeTimer);
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
                <div className={`${styles.projectDescription} ${styles.projectTableDescription}`}>
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
            width: 'minmax(144px, 18fr)',
            render: (project) => (
                <div className={styles.projectActions}>
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open the live ${project.projectName} application`}
                            title={`Open the live ${project.projectName} application`}
                            className={`${styles.projectDetailsLink} ${styles.projectActionButton}`}
                        >
                            <FaExternalLinkAlt aria-hidden="true" /> Live
                        </a>
                    )}
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
            <PageMeta {...seo} />
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
