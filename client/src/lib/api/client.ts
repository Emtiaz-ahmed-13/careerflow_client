const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type Tokens = { accessToken: string; refreshToken: string };

function getTokens(): Tokens | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("careerflow_tokens");
  return raw ? JSON.parse(raw) : null;
}

function setTokens(tokens: Tokens) {
  localStorage.setItem("careerflow_tokens", JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem("careerflow_tokens");
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) return null;
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  isFormData = false,
): Promise<T> {
  const tokens = getTokens();
  const headers: Record<string, string> = isFormData
    ? {}
    : { "Content-Type": "application/json" };

  if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;

  let res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string>) } });

  if (res.status === 401 && tokens?.refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string>) } });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const raw = err.message ?? res.statusText ?? "Request failed";
    const message = Array.isArray(raw) ? raw.join(", ") : String(raw);
    throw new Error(message);
  }

  return res.json();
}

export const auth = { getTokens, setTokens, clearTokens };

export async function uploadFile(path: string, file: File, extra: Record<string, string> = {}) {
  const tokens = getTokens();

  const doUpload = async (accessToken?: string) => {
    const form = new FormData();
    form.append("file", file);
    Object.entries(extra).forEach(([k, v]) => form.append(k, v));
    const headers: Record<string, string> = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(`${API_URL}${path}`, { method: "POST", headers, body: form });
  };

  let res = await doUpload(tokens?.accessToken);

  if (res.status === 401 && tokens?.refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await doUpload(newToken);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(err.message) ? err.message.join(", ") : (err.message ?? "Upload failed");
    throw new Error(msg);
  }
  return res.json();
}
