import { useAuth } from "../context/AuthContext";

export default function Sidebar({ sessions, currentSessionId, onSelect, onDelete, onNewChat }) {
  const { user, signOut } = useAuth();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">Pantheon</div>
        <button className="btn-new-chat" onClick={onNewChat}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New conversation
        </button>
      </div>

      {/* Session list */}
      <div className="sidebar-section-label">Conversations</div>

      <div className="sidebar-sessions">
        {sessions.length === 0 && (
          <div style={{ padding: "12px 10px", fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            No conversations yet.
          </div>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`session-item${s.id === currentSessionId ? " active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="session-title">{s.title || "Untitled"}</span>
            <button
              className="session-delete"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="user-name">{user?.username || "—"}</div>
            <div className="user-email">{user?.email || ""}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}
