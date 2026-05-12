export const getAppType = () => {
    const host = window.location.hostname;

    if (host.startsWith('admin.')) {
        return 'admin';
    }

    if (host.startsWith('login.')) {
        return 'auth';
    }

    return 'public';
};
