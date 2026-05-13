import { Card } from '../../../components/cv/Card';

export const SelectedProjectsCard = () => {
    return (
        <Card
            header={<span>Skills</span>}
            title="Project Spotlight"
            subtitle="2022 - 2026"
            content={
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget eros ac
                    ipsum ullamcorper suscipit in sed velit.
                </p>
            }
            footer={
                <>
                    <span>Product</span>
                    <span>Launch</span>
                </>
            }
        />
    );
};
