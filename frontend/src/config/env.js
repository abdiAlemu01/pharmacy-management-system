const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

export const env = {
  apiBaseUrl: rawApiUrl.replace(/\/+$/, ''),
  appName: import.meta.env.VITE_APP_NAME || 'Pharmacy Management System',
};
