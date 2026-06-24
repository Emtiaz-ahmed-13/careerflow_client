const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

function apiErrorMessage(res: Response, body: { message?: string | string[] }) {
  const raw = body.message ?? res.statusText ?? "Request failed";
  return Array.isArray(raw) ? raw.join(", ") : String(raw);
}

async function readApiError(res: Response) {
  try {
    const body = await res.json();
    return apiErrorMessage(res, body);
  } catch {
    if (res.status === 0 || res.type === "opaque") {
      return "Cannot reach API — check NEXT_PUBLIC_API_URL on Vercel client env";
    }
    return res.statusText || "Request failed";
  }
}

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

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string>) } });
  } catch {
    const hint =
      typeof window !== "undefined" && window.location.hostname !== "localhost" && API_URL.includes("localhost")
        ? "API URL not set — add NEXT_PUBLIC_API_URL on Vercel and redeploy client"
        : "Cannot reach server — check API URL and CORS on Vercel";
    throw new Error(hint);
  }

  if (res.status === 401 && tokens?.refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      try {
        res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string>) } });
      } catch {
        throw new Error("Cannot reach server — check API URL and CORS on Vercel");
      }
    }
  }

  if (!res.ok) {
    throw new Error(await readApiError(res));
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
    const msg = apiErrorMessage(res, err);
    throw new Error(msg);
  }
  return res.json();
}
