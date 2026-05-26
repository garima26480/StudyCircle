import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ProfileAvatar from "./ProfileAvatar";
import ProfilePanel from "./ProfilePanel";

function StudyNavbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsClosing(false);
  }, [location.pathname]);

  const openProfile = () => {
    setIsClosing(false);
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsClosing(true);

    window.setTimeout(() => {
      setIsProfileOpen(false);
      setIsClosing(false);
    }, 180);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    onLogout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="brand" state={{ transition: "back" }} to="/home">
          <div className="brand-mark">SC</div>
          <div className="brand-copy">
            <h2>StudyCircle</h2>
          </div>
        </Link>

        <div className="nav-actions">
          <button
            aria-expanded={isProfileOpen}
            aria-label="Open profile panel"
            className={`profile-trigger ${isProfileOpen ? "profile-trigger--active" : ""}`}
            onClick={isProfileOpen ? closeProfile : openProfile}
            type="button"
          >
            <ProfileAvatar className="profile-trigger__avatar" user={user} />
            <span className="profile-trigger__copy">
              <strong>{user.displayName || user.name}</strong>
            </span>
          </button>
        </div>
      </div>

      {isProfileOpen ? (
        <ProfilePanel
          isClosing={isClosing}
          onClose={closeProfile}
          onLogout={handleLogout}
          user={user}
        />
      ) : null}
    </header>
  );
}

export default StudyNavbar;
