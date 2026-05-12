import './System.css';

export const NotAvailable = () => {
    return (
        <div className="system-page">
            <div className="title">not available</div>
            <button onClick={() => window.location.replace('/')}>back</button>
        </div>
    );
};
