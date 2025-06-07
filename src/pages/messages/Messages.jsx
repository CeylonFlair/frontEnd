import React, { useState, useRef } from "react";
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

// Demo users to pick from
const demoUsers = [
  { id: "u1", name: "Alice Wonder" },
  { id: "u2", name: "Bob Builder" },
  { id: "u3", name: "Cathy Lane" },
];

const Messages = () => {
  const [threads, setThreads] = useState(demoThreads);
  const [selectedThreadId, setSelectedThreadId] = useState(
    threads[0]?.id || null
  );
  const [input, setInput] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handleSend = () => {
    if ((!input.trim() && !file) || !selectedThread) return;
    let newMsg = null;
    if (file) {
      // File message
      newMsg = {
        fromMe: true,
        file: {
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        },
      };
    } else {
      // Text message
      newMsg = { fromMe: true, text: input };
    }
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThreadId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMessage: file ? `📎 ${file.name}` : input,
              lastTime: "now",
            }
          : t
      )
    );
    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddThread = (user) => {
    // Check if thread already exists
    const exists = threads.some((t) => t.name === user.name);
    if (!exists) {
      const newThread = {
        id: Math.random().toString(36).slice(2),
        name: user.name,
        lastMessage: "",
        lastTime: "now",
        unread: false,
        messages: [],
      };
      setThreads((prev) => [newThread, ...prev]);
      setSelectedThreadId(newThread.id);
    } else {
      // Select existing thread
      const thread = threads.find((t) => t.name === user.name);
      setSelectedThreadId(thread.id);
    }
    setShowUserPicker(false);
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
        maxWidth: 1000, // reduced width
        margin: "32px auto", // center horizontally
      }}
    >
      {/* Thread List */}
      <div
        className="thread-list"
        style={{
          width: 250, // reduced width
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Messages</span>
          <button
            style={{
              background: "#7c3a3a",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            title="Start new chat"
            onClick={() => setShowUserPicker(true)}
          >
            +
          </button>
        </div>
        {/* User Picker Modal */}
        {showUserPicker && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.25)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowUserPicker(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: 24,
                minWidth: 260,
                boxShadow: "0 4px 24px rgba(44,62,80,0.12)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 17 }}>
                Select user to chat
              </div>
              {demoUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    fontSize: 15,
                  }}
                  onClick={() => handleAddThread(user)}
                >
                  {user.name}
                </div>
              ))}
              <button
                style={{
                  marginTop: 16,
                  background: "#eee",
                  color: "#7c3a3a",
                  border: "none",
                  borderRadius: 6,
                  padding: "7px 18px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: 14,
                  float: "right",
                }}
                onClick={() => setShowUserPicker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
          minWidth: 0,
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
                    wordBreak: "break-word",
                  }}
                >
                  {/* Show file or text */}
                  {msg.file ? (
                    <a
                      href={msg.file.url}
                      download={msg.file.name}
                      style={{
                        color: msg.fromMe ? "#fff" : "#7c3a3a",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                      }}
                    >
                      📎 {msg.file.name}
                    </a>
                  ) : (
                    msg.text
                  )}
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
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <textarea
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    border: "1px solid #e7dede",
                    padding: file ? "10px 70px 10px 10px" : "10px",
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
                  disabled={!!file}
                />
                <button
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "#eee",
                    color: "#7c3a3a",
                    border: "none",
                    borderRadius: 8,
                    padding: "0 10px",
                    fontWeight: 600,
                    fontSize: 18,
                    cursor: "pointer",
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  title="Attach file"
                  type="button"
                  tabIndex={-1}
                >
                  📎
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file && (
                  <span
                    style={{
                      position: "absolute",
                      right: 44,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 13,
                      color: "#7c3a3a",
                      background: "#f3eaea",
                      borderRadius: 6,
                      padding: "4px 8px",
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={file.name}
                  >
                    {file.name}
                    <button
                      style={{
                        marginLeft: 6,
                        background: "none",
                        border: "none",
                        color: "#c0392b",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      title="Remove file"
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                style={{
                  background: "#7c3a3a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "0 40px",
                  fontWeight: 700,
                  fontSize: 22,
                  height: 54,
                  minWidth: 110,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={handleSend}
                disabled={!input.trim() && !file}
                aria-label="Send"
              >
                {/* Arrow icon (right arrow) */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M7 16H25"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 9L25 16L18 23"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
