import axios from 'axios';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
