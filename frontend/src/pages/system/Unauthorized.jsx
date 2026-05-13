import './System.css';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';

export const Unauthorized = () => {
    return (
        <div className="system-page">
            <div className="title">unauthorized</div>
            <BasicButton onClick={() => window.location.replace('/')}>home</BasicButton>
        </div>
    );
};
