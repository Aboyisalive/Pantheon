import { useState } from "react";

export default function MessageInput({ onSend, loading }){
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    console.log("Sending:", input);

    const trimmed = input.trim();
    if (!trimmed || loading) return;

    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="message-input-container">
      <textarea
        className="message-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={loading}
        rows={1}
      />

      <button
        className="send-button"
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
      >
        Send
      </button>
    </div>
  );
}