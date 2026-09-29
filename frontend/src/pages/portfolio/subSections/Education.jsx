import { openInNewTab } from '../../../utils/utils';
import { Button } from '../../../components/buttons/Button';
import { EducationCard } from './EducationCard';
import { education } from '../../../data/portfolio';
import styles from './subSections.module.css';

export const educationSection = () => {
    const buildUniversity = ({ universityName, position, place, years, bullets = [], link }) => {
        return (
            <div
                className={styles.company}
                id={`${universityName}_${position}`}
                key={universityName}
            >
                <div className={styles.companyHeaderRow}>
                    <Button
                        type="button"
                        variant="unstyled"
                        className={`${styles.companyName} ${styles.companyNameLink} ${styles.textButton}`}
                        onClick={() => openInNewTab(link)}
                    >
                        {universityName}
                    </Button>
                    <div className={styles.companyYears}>{years}</div>
                </div>

                <div className={styles.companyRoleRow}>
                    <div className={styles.companyPosition}>{position}</div>
                    <div className={styles.companyPlace}>{place}</div>
                </div>
                <div className={styles.companyBulletsBody}>
                    {bullets.map((bullet) => (
                        <div
                            key={`${universityName}-${position}-${bullet}`}
                            className={styles.companyBullet}
                        >
                            {bullet}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return {
        id: 'education',
        stickySide: 'left',
        ratio: [40, 60],

        title: 'Education',
        titleClassName: styles.titleBodyRight,
        left: <EducationCard />,
        right: <div className={styles.textBody}>{education.map(buildUniversity)}</div>,
    };
};
