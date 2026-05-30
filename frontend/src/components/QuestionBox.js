import React, { useState } from "react";
import api from "../services/api";

function QuestionBox({
  questions,
  questionForm,
  onQuestionChange,
  onPostQuestion,
  isPosting,
  loading,
  error,
  auth,
  onUpdateQuestion,
}) {
  const [localError, setLocalError] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEditId, setSavingEditId] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!questionForm.questionText.trim()) {
      setLocalError("Please add your question before posting.");
      return;
    }

    setLocalError("");
    onPostQuestion();
  };

  const isEditable = (q) => {
    if (!auth || !auth.user) return false;

    // Validate ownership
    const ownerId = q.userId?._id || q.userId;
    if (ownerId !== auth.user.id) return false;

    // Validate time window (30 minutes)
    const timeDiff = Date.now() - new Date(q.createdAt).getTime();
    return timeDiff <= 30 * 60 * 1000;
  };

  const handleStartEdit = (q) => {
    const timeDiff = Date.now() - new Date(q.createdAt).getTime();
    if (timeDiff > 30 * 60 * 1000) {
      alert("This question can no longer be edited (30-minute limit exceeded).");
      return;
    }
    setEditingQuestionId(q._id);
    setEditQuestionText(q.questionText);
    setEditImageUrl(q.imageUrl || "");
    setEditError("");
  };

  const handleSaveEdit = async (questionId) => {
    if (!editQuestionText.trim()) {
      setEditError("Question text cannot be empty.");
      return;
    }

    try {
      setSavingEditId(questionId);
      setEditError("");
      const response = await api.put(`/questions/${questionId}`, {
        questionText: editQuestionText.trim(),
        imageUrl: editImageUrl.trim(),
      });
      onUpdateQuestion(response.data);
      setEditingQuestionId(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update question.");
    } finally {
      setSavingEditId("");
    }
  };

  return (
    <section className="composer-card">
      <div className="section-top">
        <div>
          <h2>Doubt board</h2>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="questionText">Question</label>
          <textarea
            id="questionText"
            name="questionText"
            onChange={onQuestionChange}
            placeholder="Ask your group for help"
            value={questionForm.questionText}
            title="Write down your question or doubt here"
          />
        </div>

        <div className="field">
          <label htmlFor="imageUrl">Optional image URL</label>
          <input
            id="imageUrl"
            name="imageUrl"
            onChange={onQuestionChange}
            placeholder="https://example.com/doubt-image.png"
            type="url"
            value={questionForm.imageUrl}
            title="Provide an optional web URL to an image illustrating your doubt"
          />
        </div>

        {localError ? <div className="error-banner">{localError}</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions">
          <button className="btn-secondary" disabled={isPosting} type="submit" title="Post this doubt to the group board">
            {isPosting ? "Posting..." : "Post question"}
          </button>
        </div>
      </form>

      <div className="question-list">
        {loading ? <div className="info-banner">Loading questions...</div> : null}
        {!loading && questions.length === 0 ? (
          <div className="empty-state">No doubts posted yet. Ask the first question.</div>
        ) : null}
        {!loading &&
          questions.map((item) => (
            <article className="question-item" key={item._id}>
              <div className="item-head">
                <strong>{item.userId?.name || "Unknown user"}</strong>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {isEditable(item) && editingQuestionId !== item._id && (
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
                      title="Edit this question (available for 30 minutes after posting)"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
              </div>
              {editingQuestionId === item._id ? (
                <div className="edit-container" style={{ display: "grid", gap: "8px", marginTop: "8px" }}>
                  <textarea
                    value={editQuestionText}
                    onChange={(e) => setEditQuestionText(e.target.value)}
                    placeholder="Ask your group for help"
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
                    title="Modify your question text"
                  />
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="Optional image URL"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--surface-strong)",
                      color: "var(--text)"
                    }}
                    title="Modify your optional image URL"
                  />
                  {editError ? <div className="error-banner" style={{ padding: "6px 10px", fontSize: "0.8rem" }}>{editError}</div> : null}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn"
                      onClick={() => handleSaveEdit(item._id)}
                      disabled={savingEditId === item._id || !editQuestionText.trim()}
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      title="Save your changes to this doubt"
                    >
                      {savingEditId === item._id ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => setEditingQuestionId(null)}
                      style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      title="Cancel editing and discard changes"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{item.questionText}</p>
                  {item.imageUrl ? (
                    <a className="helper-link" href={item.imageUrl} rel="noreferrer" target="_blank" title="Open the attached doubt image in a new browser tab">
                      Open attached image
                    </a>
                  ) : null}
                </>
              )}
            </article>
          ))}
      </div>
    </section>
  );
}

export default QuestionBox;
