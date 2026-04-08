export default function Sidebar({ sessions, activeSessionId, onSelect, onNew, onLogout, username }) {
  const initial = username ? username[0].toUpperCase() : "?";

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">pantheon</div>
        <button className="sidebar-new-btn" onClick={onNew}>
          <span>+</span> New chat
        </button>
      </div>

      <div className="sidebar-list">
        {sessions.length === 0 && (
          <div style={{ padding: "12px 10px", color: "var(--text-faint)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            No chats yet
          </div>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`sidebar-session ${s.id === activeSessionId ? "active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="sidebar-session-title">{s.title || "New Chat"}</span>
            {/* delete kept minimal — add if backend supports it */}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <span className="sidebar-username">{username}</span>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
