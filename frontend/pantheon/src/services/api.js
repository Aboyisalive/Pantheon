const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ── Token helpers ────────────────────────────────────────────
export const getToken  = ()         => localStorage.getItem("token");
export const setToken  = (t)        => localStorage.setItem("token", t);
export const clearToken = ()        => localStorage.removeItem("token");
export const getUser   = ()         => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};
export const setUser   = (u)        => localStorage.setItem("user", JSON.stringify(u));
export const clearUser = ()         => localStorage.removeItem("user");

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────
export async function register({ username, email, password }) {
  return handle(
    await fetch(`${API_BASE}/api/v1/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
  );
}

export async function login({ email, password }) {
  // Backend expects form-encoded for OAuth2PasswordRequestForm
  const form = new URLSearchParams();
  form.append("username", email);   // FastAPI OAuth2 uses "username" field
  form.append("password", password);

  const res = await fetch(`${API_BASE}/api/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  const data = await handle(res);
  setToken(data.access_token);
  return data;
}

export function logout() {
  clearToken();
  clearUser();
}

// ── Sessions ─────────────────────────────────────────────────
export async function createSession(title = "New Chat") {
  return handle(
    await fetch(`${API_BASE}/api/v1/sessions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title }),
    })
  );
}

export async function getSessions() {
  return handle(
    await fetch(`${API_BASE}/api/v1/sessions`, {
      headers: authHeaders(),
    })
  );
}

// ── Messages ─────────────────────────────────────────────────
export async function sendMessage({ message, session_id }) {
  return handle(
    await fetch(`${API_BASE}/api/v1/message`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message, session_id }),
    })
  );
}

export async function getMessages(sessionId, skip = 0, limit = 50) {
  return handle(
    await fetch(
      `${API_BASE}/api/v1/sessions/${sessionId}/messages?skip=${skip}&limit=${limit}`,
      { headers: authHeaders() }
    )
  );
}
