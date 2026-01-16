
const BASE_URL = import.meta.env.VITE_API_BASE;

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { 
    ...options, 
    headers,
    credentials: 'include' // Send httpOnly cookies
  });
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }
  
  return data;
}

// Upload file to backend (separate function for file uploads)
async function uploadFile(path, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }
  
  return data;
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body) => apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
  upload: uploadFile,
};
