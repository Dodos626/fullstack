import { ProfessionalExperienceCard } from './ProfessionalExperienceCard';
import styles from './subSections.module.css';

import { openInNewTab } from '../../../utils/utils';

export const professionalExperienceSection = () => {
    const buildCompany = ({ CompanyName, Position, Place, Years, Bullets = [], options = {} }) => {
        const hasLink = options?.link;

        return (
            <div className={styles.company} id={`${CompanyName}_${Position}`}>
                <div className={styles.companyHeaderRow}>
                    <div
                        className={[styles.companyName, hasLink && styles.companyNameLink]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={
                            options?.link
                                ? () => {
                                      openInNewTab(options?.link);
                                  }
                                : null
                        }
                    >
                        {CompanyName}
                    </div>
                    <div className={styles.companyYears}>{Years}</div>
                </div>

                <div className={styles.companyRoleRow}>
                    <div className={styles.companyPosition}>{Position}</div>
                    <div className={styles.companyPlace}>{Place}</div>
                </div>
                <div className={styles.companyBulletsBody}>
                    {Bullets.map((v) => (
                        <div className={styles.companyBullet}> {v} </div>
                    ))}
                </div>
            </div>
        );
    };

    const awz = {
        CompanyName: 'Alpha Omega Zed',
        Position: 'Software Engineer',
        Place: 'Heraklion, Greece (Hybrid)',
        Years: '2023 - 2026',
        Bullets: [
            'Built OCR/NLP digitization pipelines for large-scale document processing',
            'Architected distributed microservices handling petabyte-scale datasets',
            'Created reusable frontend infrastructure accelerating delivery velocity',
            'Mentored a team of 5 engineers',
        ],
        options: {
            link: 'https://alphaomegazed.com/',
        },
    };

    const Ballista = {
        CompanyName: 'Ballista, Carrera Group, Inc.',
        Position: 'Junior Software Engineer',
        Place: 'Remote',
        Years: '2022 - 2023',
        Bullets: [
            'Developed Scala-based CQL transpiler',
            'Designed parsing/transformation pipeline',
            'Collaborated on testing and reviews',
        ],
        options: {
            link: 'https://www.linkedin.com/company/carrera-group-inc/posts/?feedView=all',
        },
    };

    return {
        id: 'professional-experience',
        stickySide: 'right',
        ratio: [60, 40],
        left: (
            <div className={styles.textBody}>
                {buildCompany(awz)}
                {buildCompany(Ballista)}
            </div>
        ),
        right: <ProfessionalExperienceCard />,
        title: 'Professional Experience',
        titleClassName: styles.titleBody,
    };
};
