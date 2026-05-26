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
          <div>
            <h3>{user.displayName || user.name}</h3>
          </div>
        </div>

        <div className="profile-panel__actions">
          <Link className="btn-ghost" onClick={onClose} state={{ transition: "forward" }} to="/profile">
            View profile
          </Link>
          <button className="btn-danger" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProfilePanel;
