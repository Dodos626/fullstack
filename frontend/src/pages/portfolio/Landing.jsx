import { SplitContainers } from '../../components/cv/SplitContainers';
import styles from './Landing.module.css';
import {
    educationSection,
    professionalExperienceSection,
    selectedProjectsSection,
} from './subSections';

export const Landing = () => {
    return (
        <div className={styles.demoSection}>
            <SplitContainers
                sections={[
                    professionalExperienceSection(),
                    educationSection(),
                    selectedProjectsSection(),
                ]}
            />
        </div>
    );
};
