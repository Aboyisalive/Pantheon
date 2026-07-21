// Trailing slashes would produce "//api/v1/..." paths, which FastAPI 404s
const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

// ── Token helpers ──────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("pantheon_token");
}

export function setToken(token) {
  localStorage.setItem("pantheon_token", token);
}

export function clearToken() {
  localStorage.removeItem("pantheon_token");
  localStorage.removeItem("pantheon_user");
}

export function getUser() {
  const raw = localStorage.getItem("pantheon_user");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function setUser(user) {
  localStorage.setItem("pantheon_user", JSON.stringify(user));
}

// ── Fetch wrapper ──────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ───────────────────────────────────────────────────
export async function register(username, email, password) {
  return apiFetch("/api/v1/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

/**
 * OAuth2PasswordRequestForm expects form-encoded body, not JSON.
 */
export async function login(email, password) {
  const form = new URLSearchParams();
  form.append("username", email); // FastAPI OAuth2 uses "username" field
  form.append("password", password);

  const res = await fetch(`${API_BASE}/api/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Login failed");
  }

  return res.json(); // { access_token, token_type }
}

// ── Account ────────────────────────────────────────────────
export async function getMe() {
  return apiFetch("/api/v1/me");
}

/**
 * Returns { user, access_token, token_type } — token is re-minted
 * because changing the email invalidates the old token subject.
 */
export async function updateProfile({ username, email }) {
  return apiFetch("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify({ username, email }),
  });
}

export async function changePassword(currentPassword, newPassword) {
  return apiFetch("/api/v1/me/password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export async function deleteAccount(password) {
  return apiFetch("/api/v1/me/delete", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// ── Sessions ───────────────────────────────────────────────
export async function createSession(title = "New Chat") {
  return apiFetch("/api/v1/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function getSessions() {
  return apiFetch("/api/v1/sessions");
}

/** patch = { title } and/or { folder_id } (folder_id: null unfiles) */
export async function updateSession(sessionId, patch) {
  return apiFetch(`/api/v1/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteSession(sessionId) {
  return apiFetch(`/api/v1/sessions/${sessionId}`, { method: "DELETE" });
}

// ── Folders ────────────────────────────────────────────────
export async function getFolders() {
  return apiFetch("/api/v1/folders");
}

export async function createFolder(name) {
  return apiFetch("/api/v1/folders", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteFolder(folderId) {
  return apiFetch(`/api/v1/folders/${folderId}`, { method: "DELETE" });
}

// ── Messages ───────────────────────────────────────────────
export async function sendMessage(message, sessionId, onToken) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return full;
      if (data.startsWith("[ERROR]")) throw new Error(data.slice(8));
      full += data;
      if (onToken) onToken(data, full);
    }
  }

  return full;
}

export async function getSessionMessages(sessionId, skip = 0, limit = 50) {
  return apiFetch(`/api/v1/sessions/${sessionId}/messages?skip=${skip}&limit=${limit}`);
}
