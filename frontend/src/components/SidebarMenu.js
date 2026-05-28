import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLayout } from "./LayoutContext";

export default function SidebarMenu({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDarkMode, showSidebarMenu, setShowSidebarMenu } = useLayout();

  // Close sidebar drawer automatically upon any route/page change
  useEffect(() => {
    setShowSidebarMenu(false);
  }, [location.pathname, setShowSidebarMenu]);

  const menuItems = [
    {
      label: "HOME",
      path: "/home",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "GROUPS",
      path: "/groups",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "THEME",
      action: toggleTheme,
      icon: isDarkMode ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ),
    },
    {
      label: "PROFILE",
      path: "/profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const handleLogoutClick = () => {
    setShowSidebarMenu(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <>
      {/* Semi-Translucent Backdrop Overlay */}
      <div
        onClick={() => setShowSidebarMenu(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8, 12, 20, 0.45)",
          backdropFilter: "blur(4px)",
          opacity: showSidebarMenu ? 1 : 0,
          pointerEvents: showSidebarMenu ? "auto" : "none",
          transition: "opacity 0.28s ease",
          zIndex: 10000,
        }}
      />

      {/* Slide-In Navigation Sidebar Drawer */}
      <aside
        className="panel"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          padding: "36px 24px",
          zIndex: 10001,
          borderTopRightRadius: "28px",
          borderBottomRightRadius: "28px",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          border: "none",
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          backdropFilter: "blur(30px)",
          boxShadow: "24px 0 60px rgba(0,0,0,0.45)",
          transform: showSidebarMenu ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* Drawer Header details */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "var(--text)" }}>StudyCircle</h3>
            <span className="tiny-text" style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700" }}>
              Navigation Menu
            </span>
          </div>
          
          <button
            onClick={() => setShowSidebarMenu(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-soft)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Menu Navigation Items list */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {menuItems.map((item, idx) => {
            const isActive = item.path && location.pathname === item.path;

            const buttonContent = (
              <>
                <span className="menu-icon" style={{ display: "flex", alignItems: "center", color: isActive ? "var(--accent)" : "inherit" }}>
                  {item.icon}
                </span>
                <span style={{ fontWeight: isActive ? "800" : "600" }}>{item.label}</span>
              </>
            );

            if (item.action) {
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 18px",
                    width: "100%",
                    border: "none",
                    borderRadius: "14px",
                    background: "transparent",
                    color: "var(--text)",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  {buttonContent}
                </button>
              );
            }

            return (
              <Link
                key={idx}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  color: isActive ? "var(--accent)" : "var(--text)",
                  background: isActive ? "rgba(168, 85, 247, 0.08)" : "transparent",
                  border: isActive ? "1px solid rgba(168, 85, 247, 0.18)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {buttonContent}
              </Link>
            );
          })}

          {/* LOGOUT Option button */}
          <button
            onClick={handleLogoutClick}
            className="logout-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 18px",
              width: "100%",
              border: "none",
              borderRadius: "14px",
              background: "transparent",
              color: "var(--danger)",
              textAlign: "left",
              transition: "all 0.2s ease",
              cursor: "pointer",
              marginTop: "20px",
              borderTop: "1px solid var(--border)",
              paddingTop: "24px",
            }}
          >
            <span className="menu-icon" style={{ display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span style={{ fontWeight: "700" }}>LOGOUT</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
