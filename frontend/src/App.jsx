import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { MatrixBackground } from './components/background/MatrixBackground';
import { DayModeProvider } from './context/DayModeContext';
import { AppRoutes } from './routes';

function App() {
    return (
        <Router>
            <AuthProvider>
                <DayModeProvider>
                    <MatrixBackground speed={0.2} blur={2} />
                    <div className="app-content">
                        <AppRoutes />
                    </div>
                </DayModeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
