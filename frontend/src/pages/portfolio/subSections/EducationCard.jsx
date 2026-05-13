import { Card } from '../../../components/cv/Card';

export const EducationCard = () => {
    return (
        <Card
            header={<span>Other Qualifications</span>}
            title="Academic Focus"
            subtitle="2013 - 2018"
            content={
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel finibus
                    nisl, non ultrices massa.
                </p>
            }
            footer={
                <>
                    <span>University</span>
                    <span>Honors</span>
                </>
            }
        />
    );
};
