import { ProfessionalExperienceCard } from './ProfessionalExperienceCard';

export const professionalExperienceSection = {
    id: 'professional-experience',
    stickySide: 'left',
    ratio: [65, 35],
    left: (
        <>
            <p>Professional Experience</p>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean bibendum, sapien in
                egestas pulvinar, erat metus interdum justo, eu interdum risus neque quis lorem.
            </p>
            <p>
                Suspendisse potenti. Praesent finibus lectus non magna facilisis, sed ultricies nibh
                malesuada. Nullam ac justo at lacus hendrerit aliquet.
            </p>
            <p>
                Curabitur congue, sem non volutpat tristique, nisi lectus lacinia ligula, et
                tincidunt nisl lorem sed urna.
            </p>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tempor finibus justo,
                sit amet hendrerit sem vulputate at.
            </p>
        </>
    ),
    right: <ProfessionalExperienceCard />,
};
