import { Card } from '../../../components/cv/Card';

export const ProfessionalExperienceCard = () => {
    return (
        <Card
            header={<span>Core Experiences</span>}
            title="Lead Roles"
            subtitle="2019 - 2026"
            content={
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, massa id
                    pretium lacinia, libero arcu auctor purus, non luctus odio lorem in nibh.
                </p>
            }
            footer={
                <>
                    <span>Team Lead</span>
                    <span>Delivery</span>
                </>
            }
        />
    );
};
