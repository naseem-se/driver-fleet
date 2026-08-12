import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('driver_auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('driver_auth_token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors;
    if (errors) return Object.values(errors)[0]?.[0] ?? error.response.data.message;
    return error.response?.data?.message ?? 'Something went wrong.';
  }
  return 'Something went wrong.';
}

export function extractValidationField(error, field) {
  if (error?.response?.status === 422) {
    const errors = error.response.data?.errors ?? {};
    return errors[field]?.[0] ?? null;
  }
  return null;
}