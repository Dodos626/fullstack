import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import './theme.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');
const application = (
    <StrictMode>
        <App />
    </StrictMode>
);

if (rootElement.hasChildNodes()) {
    hydrateRoot(rootElement, application);
} else {
    createRoot(rootElement).render(application);
}
