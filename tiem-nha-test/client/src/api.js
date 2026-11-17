export function getToken() {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

export function saveToken(token, remember) {
  sessionStorage.setItem('token', token);
}

export function clearToken() {
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
