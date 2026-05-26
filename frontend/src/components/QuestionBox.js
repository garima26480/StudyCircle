import React, { useState } from "react";

function QuestionBox({
  questions,
  questionForm,
  onQuestionChange,
  onPostQuestion,
  isPosting,
  loading,
  error,
}) {
  const [localError, setLocalError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!questionForm.questionText.trim()) {
      setLocalError("Please add your question before posting.");
      return;
    }

    setLocalError("");
    onPostQuestion();
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
          />
        </div>

        {localError ? <div className="error-banner">{localError}</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions">
          <button className="btn-secondary" disabled={isPosting} type="submit">
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
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p>{item.questionText}</p>
              {item.imageUrl ? (
                <a className="helper-link" href={item.imageUrl} rel="noreferrer" target="_blank">
                  Open attached image
                </a>
              ) : null}
            </article>
          ))}
      </div>
    </section>
  );
}

export default QuestionBox;
