import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ProfileAvatar from "./ProfileAvatar";
import ProfilePanel from "./ProfilePanel";
import { useLayout } from "./LayoutContext";

function StudyNavbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebarMenu } = useLayout();
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
    <header 
      className="navbar" 
      style={{
        position: "sticky",
        top: "14px",
        width: "calc(100% - 48px)",
        maxWidth: "1400px",
        margin: "14px auto 0",
        borderRadius: "20px",
        padding: "6px 24px",
        zIndex: 1000,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <div className="navbar-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", minHeight: "56px" }}>
        {/* Left Side: Brand Logo and 3-Lines Drawer Menu Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={toggleSidebarMenu}
            title="Toggle Sidebar Menu"
            style={{
              background: "none",
              border: "none",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              borderRadius: "50%",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(168, 85, 247, 0.08)"}
            onMouseOut={(e) => e.currentTarget.style.background = "none"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          <Link className="brand" state={{ transition: "back" }} to="/home" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-mark" style={{ width: "36px", height: "36px", borderRadius: "10px", fontSize: "0.95rem" }}>SC</div>
            <div className="brand-copy">
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", letterSpacing: "-0.02em" }}>StudyCircle</h2>
            </div>
          </Link>
        </div>

        {/* Center: Quick Shortcut Navigation Links */}
        <div className="header-shortcuts" style={{ display: "flex", gap: "28px" }}>
          <Link 
            to="/home" 
            style={{ 
              fontSize: "0.85rem", 
              fontWeight: location.pathname === "/home" ? "800" : "600", 
              color: location.pathname === "/home" ? "var(--primary)" : "var(--text-soft)",
              transition: "all 0.2s ease" 
            }}
          >
            Feed
          </Link>
          <Link 
            to="/groups" 
            style={{ 
              fontSize: "0.85rem", 
              fontWeight: location.pathname === "/groups" ? "800" : "600", 
              color: location.pathname === "/groups" ? "var(--primary)" : "var(--text-soft)",
              transition: "all 0.2s ease" 
            }}
          >
            Circles
          </Link>
          <Link 
            to="/profile" 
            style={{ 
              fontSize: "0.85rem", 
              fontWeight: location.pathname === "/profile" ? "800" : "600", 
              color: location.pathname === "/profile" ? "var(--primary)" : "var(--text-soft)",
              transition: "all 0.2s ease" 
            }}
          >
            Profile
          </Link>
        </div>

        {/* Right Side: Simplified Initials Avatar (GA or Pic, No Name Text) */}
        <div className="nav-actions">
          <button
            aria-expanded={isProfileOpen}
            aria-label="Open profile panel"
            className={`profile-trigger ${isProfileOpen ? "profile-trigger--active" : ""}`}
            onClick={isProfileOpen ? closeProfile : openProfile}
            type="button"
            style={{
              padding: "4px",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              minHeight: "38px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <ProfileAvatar className="profile-trigger__avatar" user={user} style={{ width: "30px", height: "30px" }} />
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
