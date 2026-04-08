import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";

export default function App() {
    const [ messages, setMessages ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const handleSendMessage = async (Text) => {
        console.log("Received in App:", Text);
        const newMessage = { content: Text, role: "user" };
        setMessages((prev) => [...prev, newMessage]);
        
        setLoading(true);

        try {
            const response = await fetch("/api/v1/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message,
                    session_id: currentSessionId
                })
                })

                const data = await response.json()


            console.log("Received from API:", data.text);
            const assistantMessage = { content: data.text, role: "assistant" };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            setMessages((prev) => [...prev, { content: "Error: Could not generate response.", role: "assistant" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <ChatWindow messages={messages} loading={loading} />
            <MessageInput onSend={handleSendMessage} loading={loading} />
        </div>
    );
}    
