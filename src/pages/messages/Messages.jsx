import React, { useState } from "react";
import "./Messages.scss";

const demoThreads = [
  {
    id: "1",
    name: "Charley Sharp",
    lastMessage: "Hey, are you available for a new project?",
    lastTime: "1 hour ago",
    unread: true,
    messages: [
      { fromMe: false, text: "Hey, are you available for a new project?" },
      { fromMe: true, text: "Yes, I am!" },
      { fromMe: false, text: "Great, I'll send you the details." },
    ],
  },
  {
    id: "2",
    name: "John Doe",
    lastMessage: "Can you send the invoice?",
    lastTime: "2 hours ago",
    unread: true,
    messages: [
      { fromMe: false, text: "Can you send the invoice?" },
      { fromMe: true, text: "Sure, sending now." },
    ],
  },
  {
    id: "3",
    name: "Elinor Good",
    lastMessage: "Thank you!",
    lastTime: "1 day ago",
    unread: false,
    messages: [
      { fromMe: true, text: "Your order is complete." },
      { fromMe: false, text: "Thank you!" },
    ],
  },
];

const Messages = () => {
  const [threads, setThreads] = useState(demoThreads);
  const [selectedThreadId, setSelectedThreadId] = useState(
    threads[0]?.id || null
  );
  const [input, setInput] = useState("");

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handleSend = () => {
    if (!input.trim() || !selectedThread) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThreadId
          ? {
              ...t,
              messages: [...t.messages, { fromMe: true, text: input }],
              lastMessage: input,
              lastTime: "now",
            }
          : t
      )
    );
    setInput("");
  };

  return (
    <div
      className="chat-app"
      style={{
        display: "flex",
        height: "80vh",
        border: "1px solid #eee",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Thread List */}
      <div
        className="thread-list"
        style={{
          width: 320,
          borderRight: "1px solid #eee",
          background: "#fafafa",
          overflowY: "auto",
        }}
      >
        <div
          className="thread-list-header"
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #eee",
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          Messages
        </div>
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`thread-item${
              selectedThreadId === thread.id ? " selected" : ""
            }`}
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0f0",
              background:
                selectedThreadId === thread.id ? "#f5eaea" : "#fafafa",
              cursor: "pointer",
              fontWeight: thread.unread ? 600 : 400,
              color: thread.unread ? "#7c3a3a" : "#333",
              transition: "background 0.15s",
            }}
            onClick={() => setSelectedThreadId(thread.id)}
          >
            <div style={{ fontSize: 16 }}>{thread.name}</div>
            <div
              style={{
                fontSize: 13,
                color: "#888",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {thread.lastMessage}
            </div>
            <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>
              {thread.lastTime}
            </div>
          </div>
        ))}
      </div>
      {/* Chat Window */}
      <div
        className="chat-window"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}
      >
        {selectedThread ? (
          <>
            <div
              className="chat-header"
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #eee",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              {selectedThread.name}
            </div>
            <div
              className="chat-messages"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px 24px 12px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {selectedThread.messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.fromMe ? "flex-end" : "flex-start",
                    background: msg.fromMe ? "#7c3a3a" : "#f3eaea",
                    color: msg.fromMe ? "#fff" : "#7c3a3a",
                    borderRadius: msg.fromMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    padding: "10px 16px",
                    maxWidth: "70%",
                    fontSize: 15,
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div
              className="chat-input"
              style={{
                display: "flex",
                borderTop: "1px solid #eee",
                padding: 16,
                gap: 12,
              }}
            >
              <textarea
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: "1px solid #e7dede",
                  padding: 10,
                  fontSize: 15,
                  resize: "none",
                  minHeight: 38,
                  maxHeight: 80,
                }}
                placeholder="Type a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                style={{
                  background: "#7c3a3a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "0 24px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                }}
                onClick={handleSend}
                disabled={!input.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: 32, color: "#888" }}>
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
