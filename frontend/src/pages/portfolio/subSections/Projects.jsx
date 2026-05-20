import styles from './subSections.module.css';
import { FaGithub } from 'react-icons/fa';
import { FilterTable } from '../../../components/table/FilterTable';
import { openInNewTab } from '../../../utils/utils';

export const Projects = () => {
    const GahennPlains = {
        projectName: 'Gahenn-Plains',
        description:
            'A configurable solar system simulation in Unity, implementing custom physics logic for orbital mechanics, system scaling, and real-time visualization.',
        technologies: ['Unity', 'C#'],
        github: 'https://github.com/Dodos626/Gahenn-Plains',
    };

    const SonicGame = {
        projectName: 'Sonic Game',
        description:
            'Developed in colaboration from scratch, creating the engine using C++, includes shaders and advanced techniques for optimizations.',
        technologies: ['C++'],
        github: 'https://github.com/SoultatosStefanos/Sonic-the-Hedgehog',
    };

    const Compiler = {
        projectName: 'Alpha Language Compiler and Virtual Machine',
        description:
            'Javascript like programming language with garbage collection developed in C, using YACC and LEX.',
        technologies: ['C++', 'Yacc', 'Bison'],
        github: 'https://github.com/aangelakis/AlphaCompiler',
    };

    const Fullstack = {
        projectName: 'A full stack application',
        description:
            'The one you are currently browsing, containing my CV and other small applications for learning purposes.',
        technologies: ['JavaScript', 'React', 'Node'],
        github: 'https://github.com/Dodos626/fullstack',
    };

    const fullProjects = [GahennPlains, SonicGame, Compiler, Fullstack];

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
            width: '40%',
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
            width: '10%',
            sticky: 'right',
            render: (project) => (
                <button
                    type="button"
                    className={`${styles.companyYears} ${styles.companyNameLink} ${styles.iconButton}`}
                    onClick={() => openInNewTab(project.github)}
                >
                    <FaGithub size={30} />
                </button>
            ),
        },
    ];

    return (
        <div>
            <div className={styles.titlePage}>Projects</div>

            <div className={styles.textBody}>
                <FilterTable
                    columns={columns}
                    rows={fullProjects}
                    rowKey="projectName"
                    tagsKey="technologies"
                    pageSize={4}
                />
            </div>
        </div>
    );
};
