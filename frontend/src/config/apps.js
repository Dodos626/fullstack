const rootDomain = import.meta.env.VITE_APP_ROOT_DOMAIN || 'lvh.me';
const appPort = import.meta.env.VITE_APP_PORT || window.location.port || '5173';
const appProtocol =
    import.meta.env.VITE_APP_PROTOCOL || window.location.protocol.replace(':', '') || 'http';
const appPorts = {
    hello: import.meta.env.VITE_APP_HELLO_PORT || '5174',
};

const buildUrl = (subdomain = '', path = '/') => {
    const configuredUrls = {
        public: import.meta.env.VITE_APP_MAIN_URL,
        user: import.meta.env.VITE_APP_USER_URL,
        guest: import.meta.env.VITE_APP_GUEST_URL,
        admin: import.meta.env.VITE_APP_ADMIN_URL,
        hello: import.meta.env.VITE_APP_HELLO_URL,
    };
    const appName = subdomain || 'public';
    const configuredUrl = configuredUrls[appName];

    if (configuredUrl) {
        return new URL(path, configuredUrl).toString();
    }

    const hostname = subdomain ? `${subdomain}.${rootDomain}` : rootDomain;
    const targetPort = appPorts[appName] || appPort;
    const port = targetPort ? `:${targetPort}` : '';
    return `${appProtocol}://${hostname}${port}${path}`;
};

const getCurrentApp = () => {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname === rootDomain || hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'public';
    }

    if (hostname.endsWith(`.${rootDomain}`)) {
        return hostname.slice(0, -(rootDomain.length + 1));
    }

    return 'public';
};

const roleApps = {
    admin: 'admin',
    guest: 'guest',
    user: 'user',
};

const getRoleHomeUrl = (role) => buildUrl(roleApps[role] || '', '/');
const getPublicUrl = (path = '/') => buildUrl('', path);
const navigateToUrl = (url, replace = false) => {
    if (replace) {
        window.location.replace(url);
        return;
    }

    window.location.assign(url);
};

export { buildUrl, getCurrentApp, getRoleHomeUrl, getPublicUrl, navigateToUrl };
