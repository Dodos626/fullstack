import { ProfessionalExperienceCard } from './ProfessionalExperienceCard';
import styles from './subSections.module.css';

import { UtilsFunction } from './utils';
import { openInNewTab } from '../../../utils/utils';

export const professionalExperienceSection = () => {
    const { buildPlaceYear } = UtilsFunction();

    const buildCompany = ({ CompanyName, Position, Place, Years, Bullets = [], options = {} }) => {
        const hasLink = options?.link;

        return (
            <div className={styles.company}>
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

                <div className={styles.companyPosition}>{Position}</div>
                {buildPlaceYear(Place, Years)}
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
            'Led development of digitization platforms transforming unstructured documents into structured data using OCR and NLP',
            'Architected scalable distributed web systems with microservice-based design, enabling processing of petabyte-scale datasets',
            'Built reusable frontend infrastructure and automated page-generation templates, accelerating development velocity',
            'Drove MVP scoping vs. roadmap planning',
            'Led B2B POC design',
            'Mentored teams of up to 5 engineers',
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
            'Contributed to the development of a Scala-based transpiler for Clinical Query Language (CQL)',
            'Designed parsing and transformation logic of the transpilation pipeline',
            'Collaborated with senior engineers on feature implementation, testing, and code reviews',
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
        titleSide: 'left',
        titleClassName: styles.titleBody,
    };
};
