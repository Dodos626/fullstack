import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',

    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(
                    'http://localhost:5000/api/auth/refresh',
                    {},
                    {
                        withCredentials: true,
                    }
                );

                const accessToken = response.data.data.accessToken;

                localStorage.setItem('accessToken', accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Redirect to login on the current subdomain
                const host = window.location.hostname;
                const port = window.location.port ? `:${window.location.port}` : '';

                // For lvh.me subdomains, use login subdomain
                if (host.includes('lvh.me')) {
                    window.location.href = `http://login.lvh.me${port}`;
                } else if (host === 'localhost' || host === '127.0.0.1') {
                    window.location.href = `http://localhost${port}/#/login`;
                } else {
                    window.location.href = `http://${host}${port}/#/login`;
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
