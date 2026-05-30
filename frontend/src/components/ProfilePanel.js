import React from "react";
import { Link } from "react-router-dom";

import ProfileAvatar from "./ProfileAvatar";

function ProfilePanel({ isClosing, onClose, onLogout, user }) {
  return (
    <div className="profile-panel-layer" role="presentation">
      <button
        aria-label="Close profile panel"
        className="profile-panel-backdrop"
        onClick={onClose}
        type="button"
      />

      <section
        className={`profile-panel ${isClosing ? "profile-panel--closing" : "profile-panel--open"}`}
      >
        <div className="profile-panel__header">
          <ProfileAvatar className="profile-avatar" user={user} />
          <div style={{ display: "grid", gap: "4px" }}>
            <h3>{user.displayName || user.name}</h3>
            <span className={`pill ${user.role === "teacher" ? "warm" : "neutral"}`} style={{ fontSize: "0.75rem", padding: "2px 8px", width: "fit-content", fontWeight: "700" }}>
              {user.role === "teacher" ? "Teacher" : "Student"}
            </span>
          </div>
        </div>

        <div className="profile-panel__details" style={{ display: "grid", gap: "8px", fontSize: "0.85rem", color: "var(--text-soft)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Email</span>
            <strong style={{ color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px", whiteSpace: "nowrap" }} title={user.email}>{user.email}</strong>
          </div>
          {user.department ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Department</span>
              <strong style={{ color: "var(--text)" }}>{user.department}</strong>
            </div>
          ) : null}
        </div>

        <div className="profile-panel__actions">
          <Link className="btn-ghost" onClick={onClose} state={{ transition: "forward" }} to="/profile" title="Configure your profile preferences">
            Edit profile
          </Link>
          <button className="btn-danger" onClick={onLogout} type="button" title="Sign out of your StudyCircle account">
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProfilePanel;
