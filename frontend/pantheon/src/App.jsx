import { useState, useEffect, useCallback } from "react";
import AuthPage from "./pages/AuthPage";
import Sidebar from "./components/SideBar";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import {
  getToken, getUser, setUser, logout,
  getSessions, createSession,
  sendMessage, getMessages,
} from "./services/api";

export default function App() {
  // ── Auth state ─────────────────────────────────────────────
  const [authed, setAuthed] = useState(!!getToken());
  const [currentUser, setCurrentUser] = useState(getUser());

  // ── Session / message state ────────────────────────────────
  const [sessions, setSessions]             = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages]             = useState([]);
  const [loading, setLoading]               = useState(false);

  // ── Load sessions after auth ───────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  }, []);

  useEffect(() => {
    if (authed) loadSessions();
  }, [authed, loadSessions]);

  // ── Load messages when session changes ─────────────────────
  useEffect(() => {
    if (!activeSessionId) { setMessages([]); return; }

    (async () => {
      try {
        const data = await getMessages(activeSessionId);
        // Backend returns {message, response} pairs — convert to role/content format
        const flat = data.flatMap(m => [
          { role: "user",      content: m.message  },
          { role: "assistant", content: m.response },
        ]);
        setMessages(flat);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    })();
  }, [activeSessionId]);

  // ── Auth handlers ──────────────────────────────────────────
  function handleAuth() {
    setAuthed(true);
    // user info could be fetched from a /me endpoint; for now pull from token via decode
    // or store from the register response. We leave it to be enhanced.
    setCurrentUser(getUser());
  }

  function handleLogout() {
    logout();
    setAuthed(false);
    setCurrentUser(null);
    setSessions([]);
    setMessages([]);
    setActiveSessionId(null);
  }

  // ── Session handlers ───────────────────────────────────────
  async function handleNewSession() {
    try {
      const session = await createSession("New Chat");
      setSessions(prev => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }

  function handleSelectSession(id) {
    setActiveSessionId(id);
  }

  // ── Send message ───────────────────────────────────────────
  async function handleSendMessage(text) {
    let sessionId = activeSessionId;

    // Create a session on the fly if none is active
    if (!sessionId) {
      try {
        const session = await createSession(text.slice(0, 40));
        setSessions(prev => [session, ...prev]);
        setActiveSessionId(session.id);
        sessionId = session.id;
      } catch (err) {
        console.error("Failed to create session:", err);
        return;
      }
    }

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await sendMessage({ message: text, session_id: sessionId });
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────
  if (!authed) return <AuthPage onAuth={handleAuth} />;

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="app-container">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        onLogout={handleLogout}
        username={currentUser?.username || currentUser?.email || "you"}
      />

      <div className="chat-area">
        <div className="chat-topbar">
          {activeSession ? activeSession.title : "pantheon"}
        </div>

        <ChatWindow messages={messages} loading={loading} />

        <MessageInput onSend={handleSendMessage} loading={loading} />
      </div>
    </div>
  );
}
