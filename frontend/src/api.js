const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_URL.replace(/\/api\/?$/, '');

// Turns a stored path like "/uploads/123-photo.jpg" into a full URL the browser can load
export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE}${path}`;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function authHeader() {
  const token = localStorage.getItem('mh_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', headers: authHeader(), body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE', headers: authHeader() }),

  getProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', headers: authHeader(), body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', headers: authHeader() }),

  submitQuote: (data) => request('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  getQuotes: () => request('/quotes', { headers: authHeader() }),

  submitMessage: (data) => request('/messages', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: () => request('/messages', { headers: authHeader() }),

  getSettings: () => request('/settings', { headers: authHeader() }),
  updateSettings: (data) => request('/settings', { method: 'PUT', headers: authHeader(), body: JSON.stringify(data) }),

  // Uploads a single image file (multipart) and returns { url }
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Upload failed (${res.status})`);
    }
    return res.json();
  },

  // Uploads multiple image files in one request and returns { urls: [...] }
  uploadImages: async (files) => {
    const formData = new FormData();
    for (const file of files) formData.append('images', file);
    const res = await fetch(`${API_URL}/upload/batch`, {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Upload failed (${res.status})`);
    }
    return res.json(); // { urls: [...] }
  },

  // Deletes an uploaded image from disk by filename
  deleteImage: (filename) =>
    request(`/upload/${filename}`, { method: 'DELETE', headers: authHeader() }),

  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
};
