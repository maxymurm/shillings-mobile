import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { value: token } = await Preferences.get({ key: 'auth_token' });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const { value: companyId } = await Preferences.get({ key: 'selected_company_id' });
  if (companyId) {
    config.headers['X-Company-ID'] = companyId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await Preferences.remove({ key: 'auth_token' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
