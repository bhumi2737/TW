const API_BASE = import.meta.env.VITE_API_URL || '';

export function getApiBase() {
  return API_BASE;
}

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE || window.location.origin;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return parseJsonResponse(res);
}

export const authApi = {
  me: () => apiFetch('/api/auth/me'),
  login: (credentials) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (formData) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    }),
  logout: () =>
    apiFetch('/api/auth/logout', {
      method: 'POST',
    }),
  updateProfile: (formData) =>
    apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: formData,
    }),
};

export const GOOGLE_AUTH_URL = `${
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
}/auth/google`;
