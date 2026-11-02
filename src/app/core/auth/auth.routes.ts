export const API_BASE = '/api/v1';

export const AUTH_ENDPOINTS = {
    csrf: `${API_BASE}/auth/csrf/`,
    login: `${API_BASE}/auth/login/`,
    logout: `${API_BASE}/auth/logout/`,
    me: `${API_BASE}/auth/me/`,
} as const;