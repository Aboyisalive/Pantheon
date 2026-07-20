import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import "../styles/sidebar.css";

export default function Sidebar({
  sessions, currentSessionId, onSelect, onDelete, onNewChat, isOpen, onClose, onOpenSettings,
}) {
  const { user, signOut } = useAuth();
  const { t } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  // Close the popover when clicking anywhere outside it
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  return (
    <div className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div className="sidebar-logo">Pantheon</div>
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label={t("close")}
          >
            ×
          </button>
        </div>
        <button className="btn-new-chat" onClick={onNewChat}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 1v11M1 6.5h11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {t("newChat")}
        </button>
      </div>

      <div className="sidebar-section-label">{t("convos")}</div>

      <div className="sidebar-sessions">
        {sessions.length === 0 && (
          <div className="sidebar-empty">{t("noConvos")}</div>
        )}

        {sessions.map((s) => (
          <div
            key={s.id}
            className={`session-item${s.id === currentSessionId ? " active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="session-title">{s.title || t("untitled")}</span>
            <button
              className="session-delete"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-menu-wrap" ref={menuRef}>
          {menuOpen && (
            <div className="user-menu">
              <button
                className="user-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSettings();
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("settings")}
              </button>
              <button className="user-menu-item danger" onClick={signOut}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("signOut")}
              </button>
            </div>
          )}

          <button
            className="user-info-button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="user-info">
              <div className="user-avatar">{initials}</div>
              <div className="user-meta">
                <div className="user-name">{user?.username || "—"}</div>
                <div className="user-email">{user?.email || ""}</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
