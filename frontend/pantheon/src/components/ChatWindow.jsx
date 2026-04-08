import { useEffect, useRef } from "react";
import Message from "./Message";

export default function ChatWindow({messages, loading}) {
    const bottomRef = useRef(null);
    console.log("ChatWindow messages:", messages);
    console.log("ChatWindow loading:", loading);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);
    return (
        <div className="chat-window">
            {messages.length === 0 && (
                <div className="empty-state">
                    <p>Start the convo...</p>
        </div>
            )}
            {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
            ))}

            {loading && (
                <div className="loading-indicator">
                    <p>Loading...</p>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}