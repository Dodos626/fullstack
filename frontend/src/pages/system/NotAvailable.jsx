import './System.css';
import { BasicButton } from '../../components/BasicButton';

export const NotAvailable = () => {
    return (
        <div className="system-page">
            <div className="title">not available</div>
            <BasicButton onClick={() => window.location.replace('/')}>home</BasicButton>
        </div>
    );
};
