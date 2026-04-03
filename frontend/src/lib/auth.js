/**
 * POST JSON to the backend auth API (NEXT_PUBLIC_API_URL).
 * @param {string} path - e.g. '/auth/login' (no leading slash optional)
 * @param {Record<string, unknown>} body
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function postAuth(path, body) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${p}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

export const TOKEN_STORAGE_KEY = 'token';

export function persistAuthSession(data) {
  if (data && typeof data === 'object' && 'token' in data && data.token) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    } catch {
      /* ignore */
    }
  }
}
