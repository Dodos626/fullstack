import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

export const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-container">
            <div className="error-box">
                <h1>403</h1>
                <h2>Access Denied</h2>
                <p>You do not have permission to access this resource.</p>
                <button className="back-button" onClick={() => navigate('/')}>
                    Go Back Home
                </button>
            </div>
        </div>
    );
};
