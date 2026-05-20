import { Card } from '../../../components/cv/Card';
import styles from './cards.module.css';
export const EducationCard = () => {
    return (
        <Card
            header={<div className={styles.cardHeaderTitle}>Other Qualifications</div>}
            content={
                <div className={styles.cardBody}>
                    <div className={styles.cardBodyCategory}>
                        <div className={styles.cardBodyCategoryTitle}>Languages</div>

                        <ul className={styles.cardBodyCategoryList}>
                            <li>Greek (Native)</li>
                            <li>English (Michigan ECPE)</li>
                        </ul>
                    </div>
                    <div className={styles.cardBodyCategory}>
                        <div className={styles.cardBodyCategoryTitle}>Teaching Assistant</div>
                        <div className={styles.cardBodyCategoryText}>Courses :</div>

                        <ul className={styles.cardBodyCategoryList}>
                            <li>Programming Languages and Compilers</li>
                            <li>Design Patterns</li>
                            <li>Game Development</li>
                        </ul>
                    </div>
                </div>
            }
        />
    );
};
