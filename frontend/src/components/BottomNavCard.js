import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLayout } from "./LayoutContext";

export default function BottomNavCard() {
  const location = useLocation();
  const { setShowCreateModal } = useLayout();

  // Hide the floating bottom card entirely on all groups directory and classroom chat pages
  if (location.pathname === "/groups" || location.pathname.startsWith("/group")) {
    return null;
  }

  const isGroupsPage = location.pathname === "/groups";

  return (
    <nav
      className="panel"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "fit-content",
        padding: "10px 24px",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        gap: "28px",
        zIndex: 1000,
        boxShadow: "0 14px 40px rgba(31, 41, 51, 0.18)",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Three lines list button - toggles between feed (/home) and groups list (/groups) */}
      <Link
        to={isGroupsPage ? "/home" : "/groups"}
        title={isGroupsPage ? "View Public Feed" : "View Study Circles"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: isGroupsPage ? "var(--primary)" : "rgba(139, 92, 246, 0.08)",
          color: isGroupsPage ? "#ffffff" : "var(--primary-dark)",
          transition: "all 0.2s ease",
          border: "none",
          cursor: "pointer",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          if (!isGroupsPage) e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          if (!isGroupsPage) e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)";
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </Link>

      {/* Plus button - opens global create group modal from anywhere */}
      <button
        onClick={() => setShowCreateModal(true)}
        title="Create a Study Circle"
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
          color: "#ffffff",
          transition: "all 0.2s ease",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(139, 92, 246, 0.25)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08) rotate(90deg)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </nav>
  );
}
