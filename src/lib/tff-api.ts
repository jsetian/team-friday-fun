export const API_BASE = import.meta.env.PUBLIC_TFF_API_BASE?.trim() || '/api/tff';

export function apiUrl(path = '') {
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

export async function apiRequest(path: string, init?: RequestInit) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await safeText(response);
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response;
}

async function safeText(response: Response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
