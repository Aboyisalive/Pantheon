const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function createUser(username) {
  const res = await fetch(`${API_BASE}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function createChat(userId, title = "New Chat") {
  const res = await fetch(`${API_BASE}/chats/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, title }),
  });

  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function sendMessage(userId, chatId, message) {
  const res = await fetch(`${API_BASE}/chats/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      chat_id: chatId,
      message,
    }),
  });

  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getChat(chatId) {
  const res = await fetch(`${API_BASE}/chats/${chatId}`);
  if (!res.ok) throw new Error("Failed to fetch chat");
  return res.json();
}

export async function getUserChats(userId) {
  const res = await fetch(`${API_BASE}/chats/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function deleteChat(chatId) {
  const res = await fetch(`${API_BASE}/chats/${chatId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete chat");
}