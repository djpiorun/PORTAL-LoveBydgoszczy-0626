const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";
const TOKEN_KEY = "auth_token";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | FormData | null;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = getAuthToken();
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");
  if (!(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
