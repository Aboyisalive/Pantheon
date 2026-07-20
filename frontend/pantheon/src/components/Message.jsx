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
            // eslint-disable-next-line no-unused-vars -- node/className must be destructured out so they don't reach the DOM
            code({ node, inline, className, children, ...props }) {
              return inline ? (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="code-block" {...props}>
                  {children}
                </pre>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
