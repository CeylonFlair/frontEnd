import React, { useState, useRef, useEffect } from "react";
import api from "../../utils/api";
import { io } from "socket.io-client";
import "./Messages.scss";

const Messages = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [input, setInput] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [associatedUsers, setAssociatedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const fileInputRef = useRef();


  var socket = io("https://ceylonflair-backend-fed6708afb09.herokuapp.com:5004", {
    auth: {
      token: localStorage.getItem("token"),
    },
  });
  // var socket = io("http://localhost:5004" , {
  //   auth: {
  //     token: localStorage.getItem("token"),
  //   },
  // });

  // Get current user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // Fetch threads from API on mount
  useEffect(() => {
    const fetchThreads = async () => {
      setLoadingThreads(true);
      try {
        const res = await api.get("/threads");
        // Map API threads to local thread format
        const mappedThreads = (res.data || []).map((thread) => {
          // Get the other participant
          const other = thread.participants.find(
            (p) => p.id !== currentUser?._id
          );
          return {
            id: thread._id,
            name: other?.name || "Unknown",
            profilePicture: other?.profilePicture,
            lastMessage: "", // You may want to fetch last message separately
            lastTime: "", // You may want to fetch last message time separately
            unread: false,
            messages: [],
            participants: thread.participants,
          };
        });
        setThreads(mappedThreads);
        if (mappedThreads.length > 0) {
          setSelectedThreadId(mappedThreads[0].id);
        }
      } catch {
        setThreads([]);
      }
      setLoadingThreads(false);
    };
    fetchThreads();
    // eslint-disable-next-line
  }, []);

  // Fetch messages for selected thread
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedThreadId) return;
      setLoadingMessages(true);
      try {
        const res = await api.get(`/threads/${selectedThreadId}/messages`);
        // Map API messages to local format
        const mappedMessages = (res.data || []).map((msg) => {
          if (msg.type === "text") {
            return {
              fromMe: msg.sender === currentUser?._id,
              text: msg.content,
              createdAt: msg.createdAt,
              type: "text",
            };
          } else if (msg.type === "image" || msg.type === "file") {
            return {
              fromMe: msg.sender === currentUser?._id,
              file: {
                name: msg.fileName,
                url: msg.fileUrl,
                type: msg.type,
              },
              createdAt: msg.createdAt,
              type: msg.type,
            };
          } else {
            return {
              fromMe: msg.sender === currentUser?._id,
              text: msg.content,
              createdAt: msg.createdAt,
              type: msg.type,
            };
          }
        });
        setThreads((prev) =>
          prev.map((t) =>
            t.id === selectedThreadId
              ? {
                  ...t,
                  messages: mappedMessages,
                  lastMessage:
                    mappedMessages.length > 0
                      ? mappedMessages[mappedMessages.length - 1].text ||
                        (mappedMessages[mappedMessages.length - 1].file
                          ? `📎 ${
                              mappedMessages[mappedMessages.length - 1].file
                                .name
                            }`
                          : "")
                      : "",
                  lastTime:
                    mappedMessages.length > 0
                      ? new Date(
                          mappedMessages[mappedMessages.length - 1].createdAt
                        ).toLocaleString()
                      : "",
                }
              : t
          )
        );
      } catch {
        // fallback: leave messages empty
      }
      setLoadingMessages(false);
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedThreadId]);

  // Fetch associated users when user picker opens
  const handleOpenUserPicker = async () => {
    setShowUserPicker(true);
    setLoadingUsers(true);
    try {
      let url = "orders/associated-users";
      if (currentUser?.roles?.includes("artisan")) {
        url = "orders/associated-users?role=artisan";
      }
      const res = await api.get(url);
      setAssociatedUsers(res.data.associatedUsers || []);
    } catch {
      setAssociatedUsers([]);
    }
    setLoadingUsers(false);
  };

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handleSend = async () => {
    if ((!input.trim() && !file) || !selectedThread) return;

    const formData = new FormData();
    formData.append("threadId", selectedThread.id);
    // Determine type based on file extension if file is present
    let type = "text";
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
      type = imageExts.includes(ext) ? "image" : "file";
    }
    formData.append("type", type);
    formData.append("content", file ? file.name || "file" : input);
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await api.post("/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Assume response contains the new message object
      const msg =
        res.data?.message ||
        (file
          ? {
              fromMe: true,
              file: {
                name: file.name,
                url: URL.createObjectURL(file),
                type,
              },
            }
          : { fromMe: true, text: input });

      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThreadId
            ? {
                ...t,
                messages: [...t.messages, msg],
                lastMessage: file ? `📎 ${file.name}` : input,
                lastTime: "now",
              }
            : t
        )
      );
    } catch (err) {
      // fallback to local message if API fails
      const msg = file
        ? {
            fromMe: true,
            file: {
              name: file.name,
              url: URL.createObjectURL(file),
              type,
            },
          }
        : { fromMe: true, text: input };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThreadId
            ? {
                ...t,
                messages: [...t.messages, msg],
                lastMessage: file ? `📎 ${file.name}` : input,
                lastTime: "now",
              }
            : t
        )
      );
    }
    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddThread = async (user) => {
    // Check if thread already exists
    const exists = threads.some((t) => t.name === user.name);
    if (!exists) {
      const myId = currentUser?._id;
      const participantIds = [myId, user.id];
      try {
        const res = await api.post("/threads/create", { participantIds });
        const thread = res.data?.thread;
        const other = thread.participants.find((p) => p.id !== myId);
        const newThread = {
          id: thread._id,
          name: other?.name || user.name,
          profilePicture: other?.profilePicture,
          lastMessage: "",
          lastTime: "",
          unread: false,
          messages: [],
          participants: thread.participants,
        };
        setThreads((prev) => [newThread, ...prev]);
        setSelectedThreadId(newThread.id);
      } catch (err) {
        // fallback to local thread if API fails
        const newThread = {
          id: Math.random().toString(36).slice(2),
          name: user.name,
          profilePicture: user.profilePicture,
          lastMessage: "",
          lastTime: "",
          unread: false,
          messages: [],
        };
        setThreads((prev) => [newThread, ...prev]);
        setSelectedThreadId(newThread.id);
      }
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
            onClick={handleOpenUserPicker}
          >
            +
          </button>
        </div>
        {/* Loading indicator for threads */}
        {loadingThreads ? (
          <div style={{ padding: 16, color: "#888", textAlign: "center" }}>
            Loading conversations...
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className={`thread-item${
                selectedThreadId === thread.id ? " selected" : ""
              }${thread.unread ? " unread" : ""}`}
              onClick={() => setSelectedThreadId(thread.id)}
            >
              <div
                className="thread-name"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {thread.profilePicture && (
                  <img
                    src={thread.profilePicture}
                    alt={thread.name}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      objectFit: "cover",
                      background: "#eee",
                    }}
                  />
                )}
                <span>{thread.name}</span>
              </div>
              <div className="thread-last-message">{thread.lastMessage}</div>
              <div className="thread-last-time">{thread.lastTime}</div>
            </div>
          ))
        )}
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
              {loadingUsers ? (
                <div style={{ padding: 12, color: "#888" }}>Loading...</div>
              ) : associatedUsers.length === 0 ? (
                <div style={{ padding: 12, color: "#888" }}>
                  No users found.
                </div>
              ) : (
                associatedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="user-picker-user"
                    onClick={() =>
                      handleAddThread({
                        id: user.id,
                        name: user.name,
                        profilePicture: user.profilePicture,
                      })
                    }
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                        background: "#eee",
                      }}
                    />
                    <span>{user.name}</span>
                  </div>
                ))
              )}
              <button
                className="user-picker-cancel"
                onClick={() => setShowUserPicker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Chat Window */}
      <div className="chat-window">
        {selectedThread ? (
          <>
            <div className="chat-header">{selectedThread.name}</div>
            <div className="chat-messages">
              {loadingMessages ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    minHeight: 120,
                  }}
                >
                  <span className="chat-spinner" />
                </div>
              ) : (
                selectedThread.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message${msg.fromMe ? " from-me" : ""}`}
                  >
                    {/* Show image, file, or text */}
                    {msg.file ? (
                      msg.file.type === "image" ? (
                        <a
                          href={msg.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chat-image-link"
                        >
                          <img
                            src={msg.file.url}
                            alt={msg.file.name || "sent"}
                            className="chat-image"
                            style={{
                              maxWidth: 200,
                              maxHeight: 200,
                              display: "block",
                            }}
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
                          <span className="chat-file-name">
                            {msg.file.name}
                          </span>
                        </a>
                      )
                    ) : (
                      msg.text
                    )}
                  </div>
                ))
              )}
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
