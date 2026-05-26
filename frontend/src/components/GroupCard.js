import React from "react";
import { useNavigate } from "react-router-dom";

function GroupCard({ group, currentUserId, onJoin, joinLoadingId }) {
  const navigate = useNavigate();
  const memberCount = group.members?.length || 0;
  const isMember = group.members?.some((member) => {
    const memberId = typeof member === "string" ? member : member._id;
    return memberId === currentUserId;
  });

  return (
    <article className="group-card">
      <div className="group-card-top">
        <div className="card-head">
          <h3>{group.groupName}</h3>
        </div>
        <span className={`pill ${group.role === "teacher" ? "warm" : ""}`}>
          {group.role === "teacher" ? "Teacher-led" : "Student-led"}
        </span>
      </div>

      <div className="group-meta">
        <span className="pill neutral">{memberCount} members</span>
      </div>

      <div className="group-card-actions">
        <button
          className="btn-ghost"
          onClick={() => navigate(`/group/${group._id}`, { state: { transition: "forward" } })}
          type="button"
        >
          Open group
        </button>

        {isMember ? (
          <button
            className="btn"
            onClick={() => navigate(`/group/${group._id}`, { state: { transition: "forward" } })}
            type="button"
          >
            Enter chat
          </button>
        ) : (
          <button
            className="btn-secondary"
            disabled={joinLoadingId === group._id}
            onClick={() => onJoin(group._id)}
            type="button"
          >
            {joinLoadingId === group._id ? "Joining..." : "Join group"}
          </button>
        )}
      </div>
    </article>
  );
}

export default GroupCard;
