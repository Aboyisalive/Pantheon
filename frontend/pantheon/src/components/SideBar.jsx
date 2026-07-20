import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import "../styles/sidebar.css";

function SessionItem({
  session, active, folders, t,
  onSelect, onDelete, onRename, onMove, onCreateFolder,
  menuOpen, onToggleMenu, onCloseMenu,
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(session.title || "");
  const [moveOpen, setMoveOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onCloseMenu();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen, onCloseMenu]);

  function commitRename() {
    const title = draft.trim();
    setRenaming(false);
    if (title && title !== session.title) onRename(session.id, title);
    else setDraft(session.title || "");
  }

  async function handleNewFolder(e) {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    try {
      const folder = await onCreateFolder(name);
      onMove(session.id, folder.id);
    } catch (err) {
      console.error(err);
    }
    onCloseMenu();
  }

  return (
    <div
      className={`session-item${active ? " active" : ""}`}
      onClick={() => !renaming && onSelect(session.id)}
    >
      {renaming ? (
        <input
          ref={inputRef}
          className="session-rename-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraft(session.title || "");
              setRenaming(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="session-title">{session.title || t("untitled")}</span>
      )}

      <div className="session-menu-wrap" onClick={(e) => e.stopPropagation()}>
        <button
          className="session-menu-button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => {
            // fresh submenu state on every open
            setMoveOpen(false);
            setNewFolderName("");
            onToggleMenu();
          }}
        >
          ⋯
        </button>

        {menuOpen && (
          <div className="session-menu" ref={menuRef}>
            <button
              className="session-menu-item"
              onClick={() => {
                setDraft(session.title || "");
                setRenaming(true);
                onCloseMenu();
              }}
            >
              {t("rename")}
            </button>

            <button
              className="session-menu-item"
              onClick={() => setMoveOpen((o) => !o)}
            >
              {t("moveToFolder")} ▸
            </button>

            {moveOpen && (
              <div className="session-menu-sub">
                {folders
                  .filter((f) => f.id !== session.folder_id)
                  .map((f) => (
                    <button
                      key={f.id}
                      className="session-menu-item"
                      onClick={() => {
                        onMove(session.id, f.id);
                        onCloseMenu();
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                <form className="session-menu-newfolder" onSubmit={handleNewFolder}>
                  <input
                    className="session-rename-input"
                    placeholder={t("folderName")}
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                  <button className="session-menu-item" type="submit">
                    + {t("newFolder")}
                  </button>
                </form>
              </div>
            )}

            {session.folder_id != null && (
              <button
                className="session-menu-item"
                onClick={() => {
                  onMove(session.id, null);
                  onCloseMenu();
                }}
              >
                {t("removeFromFolder")}
              </button>
            )}

            <button
              className="session-menu-item danger"
              onClick={() => {
                onDelete(session.id);
                onCloseMenu();
              }}
            >
              {t("deleteChat")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  sessions, folders, currentSessionId,
  onSelect, onDelete, onRename, onMove, onCreateFolder, onDeleteFolder,
  onNewChat, isOpen, onClose, onOpenSettings,
}) {
  const { user, signOut } = useAuth();
  const { t } = useSettings();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const userMenuRef = useRef(null);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [userMenuOpen]);

  function toggleFolder(id) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const search = query.trim().toLowerCase();
  const matches = (s) => !search || (s.title || "").toLowerCase().includes(search);
  const visibleSessions = sessions.filter(matches);
  const unfiled = visibleSessions.filter((s) => s.folder_id == null);

  const renderSession = (s) => (
    <SessionItem
      key={s.id}
      session={s}
      active={s.id === currentSessionId}
      folders={folders}
      t={t}
      onSelect={onSelect}
      onDelete={onDelete}
      onRename={onRename}
      onMove={onMove}
      onCreateFolder={onCreateFolder}
      menuOpen={openMenuId === s.id}
      onToggleMenu={() => setOpenMenuId((id) => (id === s.id ? null : s.id))}
      onCloseMenu={() => setOpenMenuId(null)}
    />
  );

  return (
    <div className={`sidebar${isOpen ? " sidebar--open" : " sidebar--collapsed"}`}>
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
        <div className="sidebar-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.4" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <input
            className="sidebar-search-input"
            type="search"
            placeholder={t("searchChats")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="sidebar-search-clear"
              onClick={() => setQuery("")}
              aria-label={t("close")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-sessions">
        {folders.map((f) => {
          const inFolder = visibleSessions.filter((s) => s.folder_id === f.id);
          if (search && inFolder.length === 0) return null;
          const isCollapsed = !search && collapsed.has(f.id);
          return (
            <div className="folder-group" key={f.id}>
              <div className="folder-header" onClick={() => toggleFolder(f.id)}>
                <span className="folder-chevron">{isCollapsed ? "▸" : "▾"}</span>
                <span className="folder-name">{f.name}</span>
                <span className="folder-count">{inFolder.length}</span>
                <button
                  className="folder-delete"
                  title={t("deleteChat")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(f.id);
                  }}
                >
                  ×
                </button>
              </div>
              {!isCollapsed && inFolder.map(renderSession)}
            </div>
          );
        })}

        <div className="sidebar-section-label">{t("convos")}</div>

        {visibleSessions.length === 0 && (
          <div className="sidebar-empty">{t("noConvos")}</div>
        )}

        {unfiled.map(renderSession)}
      </div>

      <div className="sidebar-footer">
        <button
          className="btn-new-chat"
          onClick={onNewChat}
          title={t("newChat")}
          aria-label={t("newChat")}
        >
          <svg width="16" height="16" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 1v11M1 6.5h11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="user-menu-wrap" ref={userMenuRef}>
          {userMenuOpen && (
            <div className="user-menu">
              <button
                className="user-menu-item"
                onClick={() => {
                  setUserMenuOpen(false);
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
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
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
