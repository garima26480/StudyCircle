import React from "react";

function ProfileAvatar({ className = "", size = "md", user, style }) {
  const initialsSource = user?.displayName || user?.name || "SC";
  const initials = initialsSource.slice(0, 2).toUpperCase();
  const avatarClassName = `profile-avatar-shell profile-avatar-shell--${size} ${className}`.trim();

  if (user?.profilePicture) {
    return (
      <span className={avatarClassName} style={style}>
        <img
          alt={`${user.displayName || user.name} avatar`}
          className="profile-avatar-image"
          src={user.profilePicture}
        />
      </span>
    );
  }

  return <span className={avatarClassName} style={style}>{initials}</span>;
}

export default ProfileAvatar;
