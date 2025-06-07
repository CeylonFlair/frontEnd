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
    <div className="chat-app">
      {/* Thread List */}
      <div className="thread-list">
        <div className="thread-list-header">
          <span>Messages</span>
          <button
            className="add-thread-btn"
            title="Start new chat"
            onClick={() => setShowUserPicker(true)}
          >
            +
          </button>
        </div>
        {/* User Picker Modal */}
        {showUserPicker && (
          <div
            className="user-picker-modal-bg"
            onClick={() => setShowUserPicker(false)}
          >
            <div
              className="user-picker-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="user-picker-title">Select user to chat</div>
              {demoUsers.map((user) => (
                <div
                  key={user.id}
                  className="user-picker-user"
                  onClick={() => handleAddThread(user)}
                >
                  {user.name}
                </div>
              ))}
              <button
                className="user-picker-cancel"
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
            }${thread.unread ? " unread" : ""}`}
            onClick={() => setSelectedThreadId(thread.id)}
          >
            <div className="thread-name">{thread.name}</div>
            <div className="thread-last-message">{thread.lastMessage}</div>
            <div className="thread-last-time">{thread.lastTime}</div>
          </div>
        ))}
      </div>
      {/* Chat Window */}
      <div className="chat-window">
        {selectedThread ? (
          <>
            <div className="chat-header">{selectedThread.name}</div>
            <div className="chat-messages">
              {selectedThread.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message${msg.fromMe ? " from-me" : ""}`}
                >
                  {/* Show image, file, or text */}
                  {msg.file ? (
                    msg.file.type.startsWith("image/") ? (
                      <a
                        href={msg.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-image-link"
                      >
                        <img
                          src={msg.file.url}
                          alt="sent"
                          className="chat-image"
                        />
                      </a>
                    ) : (
                      <a
                        href={msg.file.url}
                        download={msg.file.name}
                        className="chat-file-link"
                      >
                        <span className="chat-file-icon">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M6 2V6C6 7.10457 6.89543 8 8 8H12C13.1046 8 14 7.10457 14 6V2"
                              stroke="#7c3a3a"
                              strokeWidth="1.5"
                            />
                            <rect
                              x="4"
                              y="2"
                              width="12"
                              height="16"
                              rx="2"
                              stroke="#7c3a3a"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M8 13H12"
                              stroke="#7c3a3a"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                        <span className="chat-file-name">{msg.file.name}</span>
                      </a>
                    )
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <div className="chat-input-area">
                <textarea
                  className="chat-textarea"
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
                  style={{
                    padding: file ? "10px 70px 10px 10px" : undefined,
                  }}
                />
                <button
                  className="chat-attach-btn"
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
                  <span className="chat-file-preview" title={file.name}>
                    {file.name}
                    <button
                      className="chat-file-remove"
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
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() && !file}
                aria-label="Send"
              >
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
          <div className="chat-empty">Select a conversation</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
