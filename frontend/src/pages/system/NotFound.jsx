import './System.css';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';

export const NotFound = () => {
    return (
        <div className="system-page">
            <div className="title">not found</div>
            <BasicButton onClick={() => window.location.replace('/')}>home</BasicButton>
        </div>
    );
};
