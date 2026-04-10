import { useState } from "react";

export default function MessageInput({ onSend, loading }) {
  const [input, setInput] = useState("");

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="message-input-container">
      <div className="input-wrapper">
        <textarea
          className="message-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Talk toPantheon…"
          disabled={loading}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          title="Send"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M8 2l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <p className="input-hint">Enter to send · Shift+Enter for newline</p>
    </div>
  );
}
