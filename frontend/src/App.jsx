import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { AppRoutes } from './routes';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
