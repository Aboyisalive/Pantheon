import { useState } from "react";
import { login, register } from "../services/api";

export default function AuthPage({ onAuth }) {
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register({ username, email, password });
        // Auto-login after registration
      }
      await login({ email, password });
      onAuth();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(m => m === "login" ? "register" : "login");
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">pantheon</div>
        <div className="auth-tagline">// your AI, your context</div>

        <div className="auth-title">
          {mode === "login" ? "Sign in" : "Create an account"}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="your_handle"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          {" "}
          <button onClick={switchMode} type="button">
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
