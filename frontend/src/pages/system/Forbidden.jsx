import './System.css';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';

export const Forbidden = () => {
    return (
        <div className="system-page">
            <div className="title">forbidden</div>
            <BasicButton onClick={() => window.location.replace('/')}>home</BasicButton>
        </div>
    );
};
