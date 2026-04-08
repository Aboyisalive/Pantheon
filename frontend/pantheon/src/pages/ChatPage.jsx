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
        // Backend returns {message, response} pairs — expand to message array
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
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ── Select session ─────────────────────────────────────────
  const handleSelectSession = useCallback((id) => {
    setCurrentSessionId(id);
  }, []);

  // ── Delete session ─────────────────────────────────────────
  const handleDeleteSession = useCallback(
    (id) => {
      // Optimistic removal (no delete endpoint in current backend spec,
      // extend when you add one)
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

      // Auto-create a session if there isn't one
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

      // Optimistically add the user message
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setLoading(true);

      try {
        const result = await sendMessage(text, sessionId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.response },
        ]);

        // Update session title if it was auto-named
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
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
        onNewChat={handleNewChat}
      />

      <div className="chat-main">
        <div className="chat-header">
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
