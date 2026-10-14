import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { publicSeoRoutes } from './seo/siteMetadata';

const render = (path) =>
    renderToString(<App RouterComponent={StaticRouter} routerProps={{ location: path }} />);

export { publicSeoRoutes, render };
