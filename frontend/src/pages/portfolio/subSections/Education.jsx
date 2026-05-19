import { openInNewTab } from '../../../utils/utils';
import { EducationCard } from './EducationCard';
import styles from './subSections.module.css';

export const educationSection = () => {
    const buildUniversity = ({
        UniversityName,
        Position,
        Place,
        Years,
        Bullets = [],
        options = {},
    }) => {
        const hasLink = options?.link;

        return (
            <div className={styles.company} id={`${UniversityName}_${Position}`}>
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
                        {UniversityName}
                    </div>
                    <div className={styles.companyYears}>{Years}</div>
                </div>

                <div className={styles.companyRoleRow}>
                    <div className={styles.companyPosition}>{Position}</div>
                    <div className={styles.companyPlace}>{Place}</div>
                </div>
                <div className={styles.companyBulletsBody}>
                    {Bullets.map((v, index) => (
                        <div
                            key={`${UniversityName}-${Position}-${index}`}
                            className={styles.companyBullet}
                        >
                            {v}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const Master = {
        UniversityName: 'Master Of Science',
        Position: 'Computer Science Department',
        Place: 'University of Crete, Heraklion, Greece',
        Years: '02/2024 - 02/2026',
        Bullets: [
            'Major: Software Engineering and Programming Languages',
            'Minor: High Performance Distributed Systems',
            'CGPA 9.3/10',
        ],
        options: {
            link: 'https://www.csd.uoc.gr/',
        },
    };

    const Bachelor = {
        UniversityName: 'Bachelor of Science',
        Position: 'Computer Science Department',
        Place: 'University of Crete, Heraklion, Greece',
        Years: '09/2019 - 06/2023',
        Bullets: ['Specialization: Software Engineering and Programming Languages', 'CGPA 8.05/10'],
        options: {
            link: 'https://www.csd.uoc.gr/',
        },
    };

    return {
        id: 'education',
        stickySide: 'left',
        ratio: [40, 60],

        title: 'Education',
        titleClassName: styles.titleBodyRight,
        left: <EducationCard />,
        right: (
            <div className={styles.textBody}>
                {buildUniversity(Master)}
                {buildUniversity(Bachelor)}
            </div>
        ),
    };
};
