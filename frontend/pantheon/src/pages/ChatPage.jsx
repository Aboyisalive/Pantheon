import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import {
  getSessions,
  createSession,
  getSessionMessages,
  sendMessage,
} from "../services/api";

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Load sessions on mount ─────────────────────────────────
  useEffect(() => {
    getSessions()
      .then((data) => {
        setSessions(data);
        if (data.length > 0 && !currentSessionId) {
          setCurrentSessionId(data[data.length - 1].id);
        }
      })
      .catch(console.error);
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
      setSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ── Select session ─────────────────────────────────────────
  const handleSelectSession = useCallback((id) => {
    setCurrentSessionId(id);
    setSidebarOpen(false);
  }, []);

  // ── Delete session ─────────────────────────────────────────
  const handleDeleteSession = useCallback(
    (id) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        setCurrentSessionId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        setMessages([]);
      }
    },
    [currentSessionId, sessions]
  );

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
        currentSessionId={currentSessionId}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="chat-main">
        <div className="chat-header">
          {/* Hamburger — mobile only */}
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