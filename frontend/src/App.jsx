import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { MatrixBackground } from './components/background/MatrixBackground';
import { ScrollToTop } from './components/navigation/ScrollToTop';
import { DayModeProvider } from './context/DayModeContext';
import { AppRoutes } from './routes';

function App({ RouterComponent = Router, routerProps = {} }) {
    return (
        <RouterComponent {...routerProps}>
            <ScrollToTop />
            <AuthProvider>
                <DayModeProvider>
                    <MatrixBackground speed={0.2} blur={2} />
                    <div className="app-content">
                        <AppRoutes />
                    </div>
                </DayModeProvider>
            </AuthProvider>
        </RouterComponent>
    );
}

export default App;
