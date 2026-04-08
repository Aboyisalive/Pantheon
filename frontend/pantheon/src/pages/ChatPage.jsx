import { useEffect, useState } from "react";
import { createUser, sendMessage, getChat } from "../lib/api";
import { getUserChats, deleteChat } from "../lib/api";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

export default function ChatPage() {
  const [username] = useState("kaname");
  const [userId, setUserId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedChatId = localStorage.getItem("chatId");
    
    if (savedUserId) setUserId(Number(savedUserId));
    if (savedChatId) setChatId(Number(savedChatId));
  }, []);

  useEffect(() => {
    if (userId) localStorage.setItem("userId", userId);
  }, [userId]);

  useEffect(() => {
    if (chatId) localStorage.setItem("chatId", chatId);
  }, [chatId]);

  useEffect(() => {
    async function loadChat() {
      if (!chatId) return;

      try {
        const chat = await getChat(chatId);
        setMessages(chat.messages);
      } catch (err) {
        console.error(err);
      }
    }

    loadChat();
  }, [chatId]);

  useEffect(() => {
    async function init() {
      try {
        const user = await createUser(username);
        setUserId(user.id);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, [username]);

  async function handleSend() {
    if (!input.trim() || !userId || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const result = await sendMessage(userId, chatId, currentInput);

      if (!chatId) {
        setChatId(result.chat_id);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function refreshChat() {
    if (!chatId) return;
    try {
      const chat = await getChat(chatId);
      setMessages(chat.messages);
    } catch (err) {
      console.error(err);
    }
  }

  
  
  useEffect(() => {
    async function loadChats() {
      if (!userId) return;

      try {
        const data = await getUserChats(userId);
        setChats(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadChats();
  }, [userId]);

  function handleSelectChat(id) {
    setChatId(id);
  }

  async function handleDeleteChat(id) {
    try {
      await deleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));

      if (chatId === id) {
        setChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Sidebar
        chats={chats}
        onSelect={handleSelectChat}
        onDelete={handleDeleteChat}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        <ChatWindow messages={messages} loading={loading} />

        <div style={{ padding: 16 }}>
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
          />
        </div>

      </div>
    </div>
  );
}