import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { DayModeProvider } from './context/DayModeContext';
import { AppRoutes } from './routes';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <DayModeProvider>
                    <AppRoutes />
                </DayModeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
