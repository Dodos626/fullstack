import { SplitContainers } from '../../components/cv/SplitContainers';
import {
    educationSection,
    professionalExperienceSection,
    selectedProjectsSection,
} from './subSections';

export const Landing = () => {
    return (
        <SplitContainers
            sections={[
                professionalExperienceSection(),
                educationSection(),
                selectedProjectsSection(),
            ]}
        />
    );
};
