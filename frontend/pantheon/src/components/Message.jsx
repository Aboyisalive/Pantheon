import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Message({ role, content }) {
    const isUser = role === "user";

    return (
        <div className={`message-row ${isUser ? "user" : "assistant"}`}>
            <div className={`message ${isUser ? "user-message" : "assistant-message"}`}>
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({node, inline, className, children, ...props}) {
                            return inline ? (
                                <code className="inline-code" {...props}>
                                    {children}
                                </code>
                            ) : (
                                <pre className="code-block" {...props}>
                                    {children}
                                </pre>
                            );
                        }
                    }} >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}