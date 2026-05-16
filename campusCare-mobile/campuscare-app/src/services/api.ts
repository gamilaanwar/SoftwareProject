import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  // If we are in development, dynamically get the host IP from Expo Constants
  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri || '';
    const localhost = debuggerHost.split(':')[0];
    
    if (localhost) {
      // Check if it's an Android emulator (which often uses 10.0.2.2 to access host)
      // or if it's a physical device/iOS emulator using the local network IP
      return `http://${localhost}:5001`;
    }

    // Android emulator fallback if hostUri is unavailable
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001';
    }

    // iOS/Web fallback
    return 'http://localhost:5001';
  }

  // Fallback for production or if debuggerHost is unavailable
  return 'https://undoing-purging-manila.ngrok-free.dev';
};

const ROOT_URL = getBaseUrl();
const BASE_URL = `${ROOT_URL}/api`;
export const IMAGE_BASE_URL = ROOT_URL;
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const request = async (endpoint: string, options: RequestInit = {}, params?: Record<string, string>) => {
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  const headers = new Headers(options.headers || {});
  
  const isFormData = options.body && (
    options.body instanceof FormData || 
    (typeof options.body === 'object' && '_parts' in (options.body as any))
  );

  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url, { ...options, headers });
  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error(`API Error at ${url}:`, responseText);
    throw new Error('Server returned invalid data');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  auth: {
    login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  issues: {
    submit: (issueData: any) => request('/issues', { method: 'POST', body: issueData }),
    getAll: (params?: Record<string, string>) => request('/issues', {}, params),
    getMy: () => request('/issues/my'),
    getById: (id: string) => request(`/issues/${id}`),
    updateStatus: (id: string, status: string) => request(`/issues/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    updatePriority: (id: string, priority: string) => request(`/issues/${id}/priority`, { method: 'PUT', body: JSON.stringify({ priority }) }),
    assign: (id: string, worker_id: string) => request(`/issues/${id}/assign`, { method: 'PUT', body: JSON.stringify({ worker_id }) }),
    addComment: (id: string, body: string) => request(`/issues/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
    uploadPhoto: (id: string, formData: FormData) => request(`/issues/${id}/photo`, { method: 'POST', body: formData as any }),
  },
  manager: {
    getWorkers: () => request('/manager/workers'),
    updateWorkerStatus: (id: string, is_active: boolean) => 
      request(`/manager/workers/${id}/status`, { method: 'PUT', body: JSON.stringify({ is_active }) }),
  },
  admin: {
    getAllUsers: () => request('/admin/users'),
    updateUserStatus: (id: string, is_active: boolean) => 
      request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ is_active }) }),
  },
};
