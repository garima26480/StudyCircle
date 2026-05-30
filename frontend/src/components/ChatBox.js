import React, { useState } from "react";
import api from "../services/api";

function ChatBox({
  messages,
  chatForm,
  onChatChange,
  onSendMessage,
  isSending,
  loading,
  error,
  auth,
  onUpdateMessage,
}) {
  const [localError, setLocalError] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEditId, setSavingEditId] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!chatForm.message.trim()) {
      setLocalError("Please type a message before sending.");
      return;
    }

    setLocalError("");
    onSendMessage();
  };

  const isEditable = (msg) => {
    if (!auth || !auth.user) return false;

    // Validate sender ownership
    const senderId = msg.sender?._id || msg.sender;
    if (senderId !== auth.user.id) return false;

    // Validate time window (30 minutes)
    const timeDiff = Date.now() - new Date(msg.createdAt).getTime();
    return timeDiff <= 30 * 60 * 1000;
  };

  const handleStartEdit = (msg) => {
    const timeDiff = Date.now() - new Date(msg.createdAt).getTime();
    if (timeDiff > 30 * 60 * 1000) {
      alert("This message can no longer be edited (30-minute limit exceeded).");
      return;
    }
    setEditingMessageId(msg._id);
    setEditMessageText(msg.message);
    setEditError("");
  };

  const handleSaveEdit = async (messageId) => {
    if (!editMessageText.trim()) {
      setEditError("Message content cannot be empty.");
      return;
    }

    try {
      setSavingEditId(messageId);
      setEditError("");
      const response = await api.put(`/messages/${messageId}`, {
        message: editMessageText.trim(),
      });
      onUpdateMessage(response.data);
      setEditingMessageId(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update message.");
    } finally {
      setSavingEditId("");
    }
  };

  return (
    <section className="feed-card">
      <div className="section-top">
        <div>
          <h2>Group chat</h2>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="message">New message</label>
          <textarea
            id="message"
            name="message"
            onChange={onChatChange}
            placeholder="Type your message to the group"
            value={chatForm.message}
            title="Write a new message to the group chat"
          />
        </div>

        {localError ? <div className="error-banner">{localError}</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions">
          <button className="btn" disabled={isSending} type="submit" title="Send this message to the group chat">
            {isSending ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>

      <div className="message-list">
        {loading ? <div className="info-banner">Loading messages...</div> : null}
        {!loading && messages.length === 0 ? (
          <div className="empty-state">No messages yet. Start the first conversation.</div>
        ) : null}
        {!loading &&
          messages.map((item) => (
            <article className="message-item" key={item._id}>
              <div className="item-head">
                <strong>{item.sender?.name || "Unknown user"}</strong>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {isEditable(item) && editingMessageId !== item._id && (
                    <button
                      onClick={() => handleStartEdit(item)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        padding: "0",
                        fontWeight: "700"
                      }}
                      type="button"
                      title="Edit this message (available for 30 minutes after posting)"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>
              {editingMessageId === item._id ? (
                <div className="edit-container" style={{ display: "grid", gap: "8px", marginTop: "8px" }}>
                  <textarea
                    value={editMessageText}
                    onChange={(e) => setEditMessageText(e.target.value)}
                    style={{
                      width: "100%",
                      height: "80px",
                      resize: "none",
                      overflowY: "auto",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--surface-strong)",
                      color: "var(--text)"
                    }}
                    title="Modify your message text"
                  />
                  {editError ? <div className="error-banner" style={{ padding: "6px 10px", fontSize: "0.8rem" }}>{editError}</div> : null}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn"
                      onClick={() => handleSaveEdit(item._id)}
                      disabled={savingEditId === item._id || !editMessageText.trim()}
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      title="Save your changes to this message"
                    >
                      {savingEditId === item._id ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => setEditingMessageId(null)}
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      title="Cancel editing and discard changes"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>{item.message}</p>
              )}
            </article>
          ))}
      </div>
    </section>
  );
}

export default ChatBox;
