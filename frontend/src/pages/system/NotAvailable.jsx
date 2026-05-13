import './System.css';
import { BasicButton } from '../../components/buttons/basic-button/BasicButton';

export const NotAvailable = () => {
    return (
        <div className="system-page">
            <div className="title">not available</div>
            <BasicButton onClick={() => window.location.replace('/')}>home</BasicButton>
        </div>
    );
};
