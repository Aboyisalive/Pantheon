import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import SettingsModal from "../components/SettingsModal";
import {
  getSessions,
  createSession,
  getSessionMessages,
  sendMessage,
  updateSession,
  deleteSession,
  getFolders,
  createFolder,
  deleteFolder,
} from "../services/api";
import "../styles/chat.css";

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  // Open by default on desktop, closed on mobile (where it overlays)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => !window.matchMedia("(max-width: 720px)").matches
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
  const closeSidebarOnMobile = useCallback(() => {
    if (isMobile()) setSidebarOpen(false);
  }, []);

  // ── Close sidebar on Escape (mobile overlay only) ──────────
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile()) setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // ── Load sessions on mount ─────────────────────────────────
  useEffect(() => {
    getSessions()
      .then((data) => {
        setSessions(data);
        if (data.length > 0) {
          setCurrentSessionId((prev) => prev ?? data[data.length - 1].id);
        }
      })
      .catch(console.error);
    getFolders().then(setFolders).catch(console.error);
  }, []);

  // ── Load messages when session changes ─────────────────────
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    getSessionMessages(currentSessionId)
      .then((chats) => {
        const expanded = chats.flatMap((c) => [
          { role: "user", content: c.message },
          { role: "assistant", content: c.response },
        ]);
        setMessages(expanded);
      })
      .catch(console.error);
  }, [currentSessionId]);

  // ── New chat ───────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    try {
      const session = await createSession("New Chat");
      setSessions((prev) => [...prev, session]);
      setCurrentSessionId(session.id);
      setMessages([]);
      closeSidebarOnMobile();
    } catch (err) {
      console.error(err);
    }
  }, [closeSidebarOnMobile]);

  // ── Select session ─────────────────────────────────────────
  const handleSelectSession = useCallback((id) => {
    setCurrentSessionId(id);
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  // ── Delete session ─────────────────────────────────────────
  const handleDeleteSession = useCallback(
    async (id) => {
      try {
        await deleteSession(id);
      } catch (err) {
        console.error(err);
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        setCurrentSessionId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        setMessages([]);
      }
    },
    [currentSessionId, sessions]
  );

  // ── Rename session ─────────────────────────────────────────
  const handleRenameSession = useCallback(async (id, title) => {
    try {
      const updated = await updateSession(id, { title });
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ── Move session to folder (folderId null = unfile) ────────
  const handleMoveSession = useCallback(async (id, folderId) => {
    try {
      const updated = await updateSession(id, { folder_id: folderId });
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ── Folders ────────────────────────────────────────────────
  const handleCreateFolder = useCallback(async (name) => {
    const folder = await createFolder(name);
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  const handleDeleteFolder = useCallback(async (id) => {
    try {
      await deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setSessions((prev) =>
        prev.map((s) => (s.folder_id === id ? { ...s, folder_id: null } : s))
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ── Send message ───────────────────────────────────────────
  const handleSend = useCallback(
    async (text) => {
      if (loading) return;

      let sessionId = currentSessionId;

      if (!sessionId) {
        try {
          const session = await createSession(text.slice(0, 50));
          setSessions((prev) => [...prev, session]);
          setCurrentSessionId(session.id);
          sessionId = session.id;
        } catch (err) {
          console.error(err);
          return;
        }
      }

      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setLoading(true);

      try {
        const result = await sendMessage(text, sessionId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.response },
        ]);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId && s.title === "New Chat"
              ? { ...s, title: text.slice(0, 40) }
              : s
          )
        );
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err.message}` },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [currentSessionId, loading]
  );

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="app-container">
      {/* Mobile backdrop — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sessions={sessions}
        folders={folders}
        currentSessionId={currentSessionId}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
        onRename={handleRenameSession}
        onMove={handleMoveSession}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => {
          closeSidebarOnMobile();
          setSettingsOpen(true);
        }}
      />

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      <div className="chat-main">
        <div className="chat-header">
          {/* Sidebar toggle — overlay on mobile, collapse on desktop */}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 4h14M2 9h14M2 14h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <span className="chat-header-title">
            {currentSession ? currentSession.title : "Pantheon"}
          </span>
        </div>

        <ChatWindow messages={messages} loading={loading} />

        <MessageInput onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
}