import { ProfessionalExperienceCard } from './ProfessionalExperienceCard';
import { Button } from '../../../components/buttons/Button';
import styles from './subSections.module.css';

import { openInNewTab } from '../../../utils/utils';
import { experience } from '../../../data/portfolio';

export const professionalExperienceSection = () => {
    const buildCompany = ({ companyName, position, place, years, bullets = [], link }) => {
        return (
            <div className={styles.company} id={`${companyName}_${position}`} key={companyName}>
                <div className={styles.companyHeaderRow}>
                    <Button
                        type="button"
                        variant="unstyled"
                        className={`${styles.companyName} ${styles.companyNameLink} ${styles.textButton}`}
                        onClick={() => openInNewTab(link)}
                    >
                        {companyName}
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
                            key={`${companyName}-${position}-${bullet}`}
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
        id: 'professional-experience',
        stickySide: 'right',
        ratio: [60, 40],
        left: <div className={styles.textBody}>{experience.map(buildCompany)}</div>,
        right: <ProfessionalExperienceCard />,
        title: 'Professional Experience',
        titleClassName: styles.titleBody,
    };
};
