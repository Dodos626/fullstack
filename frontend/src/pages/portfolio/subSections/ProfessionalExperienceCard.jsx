import { Card } from '../../../components/cv/Card';

import styles from './cards.module.css';

export const ProfessionalExperienceCard = () => {
    return (
        <Card
            header={<div className={styles.cardHeaderTitle}>Core Experiences</div>}
            content={
                <ul className={styles.cardBody}>
                    <li>Full Stack Development</li>
                    <li>Distributed Systems</li>
                    <li>Microservice Architecture</li>
                    <li>Cloud Infrastructure</li>
                    <li>High-Performance Computing</li>
                    <li>Graphics Programming</li>
                    <li>Compiler Construction</li>
                </ul>
            }
        />
    );
};
