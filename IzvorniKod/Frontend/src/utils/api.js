
const BASE_URL = import.meta.env.VITE_API_BASE;

async function tryRefresh() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  return res.ok;
}

async function apiRequest(path, options = {}, allowRetry = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { 
    ...options, 
    headers,
    credentials: 'include' // Send httpOnly cookies
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    // Some responses (e.g., 401) may have empty body
  }
  
  if (!res.ok) {
    // Attempt silent refresh once on 401
    if (res.status === 401 && allowRetry) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return apiRequest(path, options, false);
      }
    }

    const error = new Error(data?.message || data?.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

// Upload file to backend (separate function for file uploads)
async function uploadFile(path, file, allowRetry = true) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  let data = null;
  try {
    data = await res.json();
  } catch (err) {}
  
  if (!res.ok) {
    if (res.status === 401 && allowRetry) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return uploadFile(path, file, false);
      }
    }
    const error = new Error(data?.message || data?.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
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
