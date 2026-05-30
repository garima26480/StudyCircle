import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ChatBox from "../components/ChatBox";
import QuestionBox from "../components/QuestionBox";
import api from "../services/api";

function Group({ auth }) {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [groupError, setGroupError] = useState("");
  const [messages, setMessages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [messageError, setMessageError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [postingQuestion, setPostingQuestion] = useState(false);
  const [chatForm, setChatForm] = useState({ message: "" });
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    imageUrl: "",
  });

  const loadInitialData = useCallback(async () => {
    try {
      setLoadingGroup(true);
      setGroupError("");
      const response = await api.get(`/groups/${id}`);
      setGroup(response.data);
    } catch (apiError) {
      setGroupError(apiError.response?.data?.message || "Unable to fetch group details.");
    } finally {
      setLoadingGroup(false);
    }

    try {
      setLoadingMessages(true);
      setMessageError("");
      const response = await api.get(`/messages/${id}`);
      setMessages(response.data);
    } catch (apiError) {
      setMessageError(apiError.response?.data?.message || "Unable to fetch messages.");
    } finally {
      setLoadingMessages(false);
    }

    try {
      setLoadingQuestions(true);
      setQuestionError("");
      const response = await api.get(`/questions/${id}`);
      setQuestions(response.data);
    } catch (apiError) {
      setQuestionError(apiError.response?.data?.message || "Unable to fetch questions.");
    } finally {
      setLoadingQuestions(false);
    }
  }, [id]);

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      setMessageError("");
      const response = await api.get(`/messages/${id}`);
      setMessages(response.data);
    } catch (apiError) {
      setMessageError(apiError.response?.data?.message || "Unable to fetch messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setQuestionError("");
      const response = await api.get(`/questions/${id}`);
      setQuestions(response.data);
    } catch (apiError) {
      setQuestionError(apiError.response?.data?.message || "Unable to fetch questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleChatChange = (event) => {
    const { name, value } = event.target;
    setChatForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (event) => {
    const { name, value } = event.target;
    setQuestionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = async () => {
    try {
      setSendingMessage(true);
      setMessageError("");
      await api.post("/messages", {
        groupId: id,
        message: chatForm.message.trim(),
      });
      setChatForm({ message: "" });
      await fetchMessages();
    } catch (apiError) {
      setMessageError(apiError.response?.data?.message || "Unable to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handlePostQuestion = async () => {
    try {
      setPostingQuestion(true);
      setQuestionError("");
      await api.post("/questions", {
        groupId: id,
        questionText: questionForm.questionText.trim(),
        imageUrl: questionForm.imageUrl.trim(),
      });
      setQuestionForm({ questionText: "", imageUrl: "" });
      await fetchQuestions();
    } catch (apiError) {
      setQuestionError(apiError.response?.data?.message || "Unable to post question.");
    } finally {
      setPostingQuestion(false);
    }
  };

  const handleUpdateMessage = (updatedMessage) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
    );
  };

  const handleUpdateQuestion = (updatedQuestion) => {
    setQuestions((prev) =>
      prev.map((q) => (q._id === updatedQuestion._id ? updatedQuestion : q))
    );
  };

  return (
    <main className="page-shell">
      <div className="inline-actions" style={{ marginBottom: "18px" }}>
        <Link className="btn-ghost" state={{ transition: "back" }} to="/home">
          Back to home
        </Link>
      </div>

      {loadingGroup ? <div className="info-banner">Loading group details...</div> : null}
      {groupError ? <div className="error-banner">{groupError}</div> : null}

      {group ? (
        <>
          <section className="hero-card">
            <div>
              <span className={`pill ${group.role === "teacher" ? "warm" : ""}`}>
                {group.role === "teacher" ? "Teacher-led group" : "Student-led group"}
              </span>
              <h1>{group.groupName}</h1>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <strong>{group.members?.length || 0}</strong>
                <span>Members</span>
              </div>
              <div className="stat-card">
                <strong>{group.isOpen ? "Open" : group.maxMembers || 10}</strong>
                <span>{group.isOpen ? "Access" : "Capacity"}</span>
              </div>
              <div className="stat-card">
                <strong>{group.createdBy?.name || "Unknown"}</strong>
                <span>Created by</span>
              </div>
            </div>
          </section>

          <section className="group-layout">
            <div className="stack">
              <ChatBox
                auth={auth}
                chatForm={chatForm}
                error={messageError}
                isSending={sendingMessage}
                loading={loadingMessages}
                messages={messages}
                onChatChange={handleChatChange}
                onSendMessage={handleSendMessage}
                onUpdateMessage={handleUpdateMessage}
              />
            </div>

            <div className="stack">
              <section className="panel">
                <div className="section-top">
                  <div>
                    <h2>Members</h2>
                  </div>
                  <span className="pill neutral">{group.members?.length || 0}</span>
                </div>
                <div className="stack">
                  <div className="info-banner">
                    Created by <strong>{group.createdBy?.name || "Unknown"}</strong>
                  </div>
                  <div className="panel" style={{ padding: "18px" }}>
                    <div className="activity-grid">
                      {group.members?.map((member) => (
                        <div className="message-item" key={member._id}>
                          <div className="item-head">
                            <strong>{member.name}</strong>
                            <span>{member.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <QuestionBox
                auth={auth}
                error={questionError}
                isPosting={postingQuestion}
                loading={loadingQuestions}
                onPostQuestion={handlePostQuestion}
                onQuestionChange={handleQuestionChange}
                questionForm={questionForm}
                questions={questions}
                onUpdateQuestion={handleUpdateQuestion}
              />
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default Group;

