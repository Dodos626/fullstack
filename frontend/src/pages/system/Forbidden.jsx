import './System.css';

export const Forbidden = () => {
    return (
        <div className="system-page">
            <div className="title">forbidden</div>
            <button onClick={() => window.location.replace('/')}>back</button>
        </div>
    );
};
