import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

/**
 * Tax Summary endpoint: GET /api/taxes/summary?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Backend column is `issued_at` (NOT `issue_date`) — fixed in backend TaxService 2026-03-16.
 */

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
