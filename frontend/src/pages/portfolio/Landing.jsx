import { SplitContainers } from '../../components/cv/SplitContainers';
import { PageMeta } from '../../components/seo/PageMeta';
import { AboutContact } from './AboutContact';
import { Hero } from './Hero';
import {
    educationSection,
    professionalExperienceSection,
    selectedProjectsSection,
} from './subSections';

const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Theodoros Chalkidis',
    jobTitle: 'Software Engineer',
    email: 'mailto:chlktheo@gmail.com',
    sameAs: [
        'https://github.com/dodos626',
        'https://www.linkedin.com/in/theodoros-chalkidis-a76879245/',
    ],
    knowsAbout: [
        'Full-stack development',
        'Distributed systems',
        'Compilers',
        'Graphics programming',
    ],
};

export const Landing = () => {
    return (
        <>
            <PageMeta structuredData={personStructuredData} />
            <Hero />
            <SplitContainers
                sections={[
                    professionalExperienceSection(),
                    educationSection(),
                    selectedProjectsSection(),
                ]}
            />
            <AboutContact />
        </>
    );
};
