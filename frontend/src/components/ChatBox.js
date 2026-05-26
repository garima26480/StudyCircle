import React, { useState } from "react";

function ChatBox({
  messages,
  chatForm,
  onChatChange,
  onSendMessage,
  isSending,
  loading,
  error,
}) {
  const [localError, setLocalError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!chatForm.message.trim()) {
      setLocalError("Please type a message before sending.");
      return;
    }

    setLocalError("");
    onSendMessage();
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
          />
        </div>

        {localError ? <div className="error-banner">{localError}</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions">
          <button className="btn" disabled={isSending} type="submit">
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
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p>{item.message}</p>
            </article>
          ))}
      </div>
    </section>
  );
}

export default ChatBox;
