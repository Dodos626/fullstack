import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,

    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshUrl = `${API_BASE.replace(/\/api$/, '')}/api/auth/refresh`;
                const response = await axios.post(
                    refreshUrl,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                const accessToken = response.data.data?.accessToken || response.data.accessToken;

                localStorage.setItem('accessToken', accessToken);
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Redirect to login on the current subdomain
                const host = window.location.hostname;
                const port = window.location.port ? `:${window.location.port}` : '';

                // Prefer VITE_APP_LOGIN_URL if provided
                const loginUrl = import.meta.env.VITE_APP_LOGIN_URL;
                if (loginUrl) {
                    window.location.href = loginUrl;
                } else if (host.includes('lvh.me')) {
                    window.location.href = `http://lvh.me${port}/login`;
                } else if (host === 'localhost' || host === '127.0.0.1') {
                    window.location.href = `http://localhost${port}/login`;
                } else {
                    window.location.href = `http://${host}${port}/login`;
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
