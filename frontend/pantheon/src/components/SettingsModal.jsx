import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { updateProfile, changePassword, setToken } from "../services/api";
import { LANGUAGES } from "../i18n";
import "../styles/settings.css";

export default function SettingsModal({ onClose }) {
  const { user, signIn } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useSettings();

  const [tab, setTab] = useState("general"); // "general" | "account"

  // Account tab state
  const [profile, setProfile] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [status, setStatus] = useState(null); // { kind: "ok" | "error", text }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const result = await updateProfile(profile);
      setToken(result.access_token);
      signIn(result.access_token, {
        username: result.user.username,
        email: result.user.email,
      });
      setStatus({ kind: "ok", text: t("profileSaved") });
    } catch (err) {
      setStatus({ kind: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await changePassword(passwords.current, passwords.next);
      setPasswords({ current: "", next: "" });
      setStatus({ kind: "ok", text: t("passwordChanged") });
    } catch (err) {
      setStatus({ kind: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t("settings")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <span className="settings-title">{t("settings")}</span>
          <button className="settings-close" onClick={onClose} aria-label={t("close")}>
            ×
          </button>
        </div>

        <div className="settings-body">
          <nav className="settings-tabs">
            <button
              className={`settings-tab${tab === "general" ? " active" : ""}`}
              onClick={() => { setTab("general"); setStatus(null); }}
            >
              {t("general")}
            </button>
            <button
              className={`settings-tab${tab === "account" ? " active" : ""}`}
              onClick={() => { setTab("account"); setStatus(null); }}
            >
              {t("account")}
            </button>
          </nav>

          <div className="settings-content">
            {tab === "general" && (
              <>
                <div className="settings-row">
                  <span className="settings-label">{t("theme")}</span>
                  <div className="segmented">
                    <button
                      className={`segment${theme === "dark" ? " active" : ""}`}
                      onClick={() => setTheme("dark")}
                    >
                      {t("themeDark")}
                    </button>
                    <button
                      className={`segment${theme === "light" ? " active" : ""}`}
                      onClick={() => setTheme("light")}
                    >
                      {t("themeLight")}
                    </button>
                  </div>
                </div>

                <div className="settings-row">
                  <span className="settings-label">{t("language")}</span>
                  <select
                    className="settings-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {tab === "account" && (
              <>
                <form className="settings-form" onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-username">
                      {t("username")}
                    </label>
                    <input
                      className="form-input"
                      id="settings-username"
                      type="text"
                      value={profile.username}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, username: e.target.value }))
                      }
                      disabled={busy}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-email">
                      {t("email")}
                    </label>
                    <input
                      className="form-input"
                      id="settings-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, email: e.target.value }))
                      }
                      disabled={busy}
                      required
                    />
                  </div>
                  <button className="btn-primary settings-save" type="submit" disabled={busy}>
                    {busy ? t("saving") : t("saveChanges")}
                  </button>
                </form>

                <form className="settings-form" onSubmit={handleChangePassword}>
                  <div className="settings-section-label">{t("changePassword")}</div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-current-password">
                      {t("currentPassword")}
                    </label>
                    <input
                      className="form-input"
                      id="settings-current-password"
                      type="password"
                      autoComplete="current-password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, current: e.target.value }))
                      }
                      disabled={busy}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-new-password">
                      {t("newPassword")}
                    </label>
                    <input
                      className="form-input"
                      id="settings-new-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.next}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, next: e.target.value }))
                      }
                      disabled={busy}
                      required
                      minLength={8}
                    />
                  </div>
                  <button className="btn-primary settings-save" type="submit" disabled={busy}>
                    {busy ? t("saving") : t("changePassword")}
                  </button>
                </form>
              </>
            )}

            {status && (
              <div className={`settings-status ${status.kind}`}>{status.text}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
