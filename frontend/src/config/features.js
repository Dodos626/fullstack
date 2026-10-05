const isDevMode = import.meta.env.VITE_APP_MODE?.trim().toLowerCase() === 'dev';

export { isDevMode };
