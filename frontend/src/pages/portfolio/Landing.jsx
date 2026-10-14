import { SplitContainers } from '../../components/cv/SplitContainers';
import { PageMeta } from '../../components/seo/PageMeta';
import { AboutContact } from './AboutContact';
import { Hero } from './Hero';
import {
    educationSection,
    professionalExperienceSection,
    selectedProjectsSection,
} from './subSections';
import { getSeoForPath } from '../../seo/siteMetadata';

export const Landing = () => {
    const seo = getSeoForPath('/');

    return (
        <>
            <PageMeta {...seo} />
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
