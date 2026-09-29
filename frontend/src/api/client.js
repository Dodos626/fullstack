import axios from 'axios';
import { getCurrentApp, getPublicUrl, navigateToUrl } from '../config/apps';

const API_BASE = import.meta.env.VITE_API_URL || 'http://lvh.me:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;
let authFailureHandler = null;

const setAccessToken = (token) => {
    accessToken = token || null;
};

const setAuthFailureHandler = (handler) => {
    authFailureHandler = handler;
};

const requestRefresh = async () => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
            .then((response) => response.data.data)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

api.interceptors.request.use((config) => {
    config.headers['X-App-Name'] = getCurrentApp();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                const session = await requestRefresh();
                setAccessToken(session.accessToken);
                originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                setAccessToken(null);
                if (authFailureHandler) {
                    authFailureHandler(refreshError);
                } else {
                    navigateToUrl(getPublicUrl('/login'), true);
                }
            }
        }

        return Promise.reject(error);
    }
);

export { requestRefresh, setAccessToken, setAuthFailureHandler };
export default api;
