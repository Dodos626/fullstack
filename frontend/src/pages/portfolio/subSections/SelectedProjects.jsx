import { openInNewTab } from '../../../utils/utils';
import { SelectedProjectsCard } from './SelectedProjectsCard';
import styles from './subSections.module.css';
import { FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const selectedProjectsSection = () => {
    const navigate = useNavigate();

    const buildProject = ({ projectName, description, technologies, github }) => {
        return (
            <div className={styles.company} id={`${projectName}`}>
                <div className={styles.companyHeaderRow}>
                    <div className={styles.companyName}>{projectName}</div>
                    <div
                        className={[styles.companyYears, styles.companyNameLink]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => {
                            openInNewTab(github);
                        }}
                    >
                        <FaGithub size={25} />
                    </div>
                </div>
                <div className={styles.projectDescription}>{description}</div>
                <div className={styles.projectTechnologiesContainer}>
                    Technologies:
                    {technologies.map((technology) => {
                        return <div className={styles.projectTechnologies}>{technology}</div>;
                    })}
                </div>
            </div>
        );
    };

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

    return {
        id: 'selected-projects',
        stickySide: 'right',
        title: 'Selected Projects',
        titleClassName: styles.titleBody,
        ratio: [60, 40],
        left: (
            <div className={styles.textBody}>
                {buildProject(GahennPlains)}
                {buildProject(SonicGame)}
                {buildProject(Compiler)}
                {buildProject(Fullstack)}
                <div className={styles.seeMore} onClick={() => navigate('/projects')}>
                    See More Projects
                </div>
            </div>
        ),
        right: <SelectedProjectsCard />,
    };
};
