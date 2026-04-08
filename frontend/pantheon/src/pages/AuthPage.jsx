import { useState } from "react";
import { login, register } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const tokenData = await login(form.email, form.password);
        // Decode minimal user info from the token payload to display in sidebar
        // (we don't have a /me endpoint, so we use what we know)
        const userData = { email: form.email, username: form.email.split("@")[0] };
        signIn(tokenData.access_token, userData);
      } else {
        if (!form.username.trim()) {
          setError("Username is required.");
          return;
        }
        const newUser = await register(form.username, form.email, form.password);
        // Auto-login after register
        const tokenData = await login(form.email, form.password);
        signIn(tokenData.access_token, {
          email: newUser.email,
          username: newUser.username,
        });
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(isLogin ? "register" : "login");
    setError("");
    setForm({ username: "", email: "", password: "" });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Pantheon</div>

        <h1 className="auth-title">
          {isLogin ? "Welcome back." : "Create an account."}
        </h1>
        <p className="auth-subtitle">
          {isLogin
            ? "Sign in to continue your conversations."
            : "Join Pantheon and start chatting."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                className="form-input"
                id="username"
                name="username"
                type="text"
                placeholder="yourname"
                value={form.username}
                onChange={handleChange}
                disabled={loading}
                autoComplete="username"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button className="auth-link" type="button" onClick={toggleMode}>
            {isLogin ? "Register" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
