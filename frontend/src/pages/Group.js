import React, { useCallback, useEffect, useState, useRef } from "react";
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

  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMembersDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getMemberStatus = (memberId) => {
    if (!memberId) return "offline";
    const charCodeSum = memberId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return charCodeSum % 2 === 0 ? "online" : "offline";
  };

  const handleOpenDetails = (member) => {
    if (member._id === auth?.user?.id) return;
    setSelectedMember(member);
    setShowMembersDropdown(false);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

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
      {showMembersDropdown && (
        <div
          className="dropdown-backdrop"
          onClick={() => setShowMembersDropdown(false)}
        />
      )}
      {loadingGroup ? <div className="info-banner">Loading group details...</div> : null}
      {groupError ? <div className="error-banner">{groupError}</div> : null}

      {group ? (
        <>
          <section
            className="hero-card"
            style={{
              zIndex: showMembersDropdown ? 46 : "auto",
              position: "relative",
            }}
          >
            <div>
              <span className={`pill ${group.role === "teacher" ? "warm" : ""}`}>
                {group.role === "teacher" ? "Teacher-led group" : "Student-led group"}
              </span>
              <h1>{group.groupName}</h1>
              <div className="inline-actions" style={{ marginTop: "14px" }}>
                <Link className="btn-ghost" state={{ transition: "back" }} to="/home" title="Return to the public Home Feed page">
                  Back to home
                </Link>
              </div>
            </div>

            <div className="hero-stats">
              <div
                className={`stat-card clickable ${showMembersDropdown ? "active-dropdown" : ""}`}
                onClick={() => setShowMembersDropdown((prev) => !prev)}
                ref={dropdownRef}
                title="Click to view group members list"
              >
                <strong>
                  {group.members?.length || 0}{" "}
                  <span style={{ fontSize: "1.1rem", verticalAlign: "middle" }}>▾</span>
                </strong>
                <span>Members</span>

                {showMembersDropdown && (
                  <div className="members-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-section-title">Group Owner</div>
                    {group.createdBy && (
                      <div
                        className={`member-row ${group.createdBy._id === auth.user.id ? "disabled" : ""}`}
                        onClick={() => handleOpenDetails(group.createdBy)}
                        title={
                          group.createdBy._id === auth.user.id
                            ? "You (Owner) - Details view disabled"
                            : `Click to view profile details of ${group.createdBy.name}`
                        }
                      >
                        <div className="member-info-left">
                          <span>{group.createdBy.name}</span>
                          {group.createdBy._id === auth.user.id && <span className="badge-you">You</span>}
                        </div>
                        <span className="badge-owner">owner</span>
                      </div>
                    )}

                    <div className="dropdown-section-title" style={{ marginTop: "6px" }}>
                      Study Circle Members
                    </div>
                    {(() => {
                      const ownerId = group.createdBy?._id || group.createdBy;
                      const otherMembers = group.members?.filter((m) => {
                        const mId = m._id || m;
                        return mId !== ownerId;
                      }) || [];

                      if (otherMembers.length === 0) {
                        return (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-soft)",
                              padding: "4px 8px",
                              fontStyle: "italic",
                              textAlign: "left",
                            }}
                          >
                            No other members
                          </div>
                        );
                      }

                      return otherMembers.map((member) => {
                        const status = getMemberStatus(member._id);
                        const isMe = member._id === auth.user.id;
                        return (
                          <div
                            key={member._id}
                            className={`member-row ${isMe ? "disabled" : ""}`}
                            onClick={() => handleOpenDetails(member)}
                            title={isMe ? "You - Details view disabled" : `Click to view profile details of ${member.name}`}
                          >
                            <div className="member-info-left">
                              <span>{member.name}</span>
                              {isMe && <span className="badge-you">You</span>}
                            </div>
                            <div className="member-status-wrapper">
                              <span className={`status-dot ${status}`}></span>
                              <span className={`status-label ${status}`}>{status}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
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

      {selectedMember ? (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMember(null)}
          role="presentation"
        >
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            style={{ width: "min(420px, 100%)", padding: "24px" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "20px",
              }}
            >
              <div
                className="profile-avatar-shell profile-avatar-shell--xl"
                style={{ fontSize: "1.8rem" }}
              >
                {getInitials(selectedMember.name)}
              </div>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: "1.4rem" }}>
                  {selectedMember.name}
                </h2>
                <span
                  className={`pill ${
                    selectedMember.role === "teacher" ? "warm" : "neutral"
                  }`}
                  style={{ textTransform: "capitalize" }}
                >
                  {selectedMember.role}
                </span>
              </div>
            </div>

            <div className="member-details-grid">
              <div className="member-detail-item">
                <span>Email Address</span>
                <strong>{selectedMember.email || "N/A"}</strong>
              </div>
              <div className="member-detail-item">
                <span>College ID</span>
                <strong>{selectedMember.collegeId || "N/A"}</strong>
              </div>
              <div className="member-detail-item">
                <span>Course</span>
                <strong>{selectedMember.course || "N/A"}</strong>
              </div>
              <div className="member-detail-item">
                <span>Year</span>
                <strong>{selectedMember.year || "N/A"}</strong>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setSelectedMember(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default Group;

