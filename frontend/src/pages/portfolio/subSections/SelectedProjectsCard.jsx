import { Card } from '../../../components/cv/Card';
import styles from './cards.module.css';

export const SelectedProjectsCard = () => {
    const programmingLanguages = [
        'JavaScript',
        'TypeScript',
        'Go',
        'Python',
        'C',
        'C++',
        'Scala',
        'SQL',
        'Bash',
    ];
    const frameworksTechnologies = [
        'React',
        'Node',
        'Docker',
        'Unity',
        'Express',
        'OpenMP',
        'MPI',
        'Godot',
    ];

    const cloudDevops = ['Github', 'Jira', 'CI/CD', 'REST APIs', 'AWS', 'GCP'];

    const systemsWorkFlows = [
        'Microservices',
        'Unix / Linux',
        'CLI tools',
        'Agile / Scrum',
        'Distributed Systems',
    ];

    const buildBoxCategory = (cat, index) => {
        return (
            <div className={styles.boxes} key={`${cat}_${index}`}>
                {cat}
            </div>
        );
    };

    const buildCategory = (name, array) => {
        return (
            <div className={styles.cardBodyCategory}>
                <div className={styles.cardBodyCategoryTitle}>{name}</div>
                <div className={styles.boxesContainer}>{array.map(buildBoxCategory)}</div>
            </div>
        );
    };

    return (
        <Card
            header={<div className={styles.cardHeaderTitle}>Skills</div>}
            content={
                <div className={styles.cardBody}>
                    {buildCategory('Programming Languages', programmingLanguages)}
                    {buildCategory('Frameworks & Technologies', frameworksTechnologies)}
                    {buildCategory('Cloud & DevOps', cloudDevops)}
                    {buildCategory('Systems & Workflows', systemsWorkFlows)}
                </div>
            }
        />
    );
};
