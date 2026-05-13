import { SelectedProjectsCard } from './SelectedProjectsCard';

export const selectedProjectsSection = {
    id: 'selected-projects',
    stickySide: 'left',
    ratio: [60, 40],
    left: (
        <>
            <p>Selected Projects</p>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque non elementum
                risus, vitae viverra lorem.
            </p>
            <p>
                Fusce luctus nulla nec ipsum dictum, quis luctus nunc posuere. Sed ut fermentum
                lectus, vitae porta nunc.
            </p>
            <p>
                Phasellus lacinia, justo id ullamcorper commodo, mauris lectus gravida purus, et
                consequat ex mauris vel augue.
            </p>
            <p>
                Integer porta, nunc vitae porta molestie, nibh augue volutpat libero, sed tincidunt
                est lorem non turpis.
            </p>
        </>
    ),
    right: <SelectedProjectsCard />,
};
