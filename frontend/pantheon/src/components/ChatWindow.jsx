import { useEffect, useRef } from "react";
import Message from "./Message";

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-window">
      {messages.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">◈</div>
          <p>Start the convo…</p>
        </div>
      )}

      {messages.map((msg, index) => (
        <Message key={index} role={msg.role} content={msg.content} />
      ))}

      {loading && (
        <div className="loading-indicator">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
