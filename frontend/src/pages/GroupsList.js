import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import GroupCard from "../components/GroupCard";
import { useLayout } from "../components/LayoutContext";

export default function GroupsList({ auth, onLogout }) {
  const { groupRefreshTrigger, setShowCreateModal } = useLayout();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinLoadingId, setJoinLoadingId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to fetch groups.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch groups when component mounts OR when a new group is created globally
  useEffect(() => {
    fetchGroups();
  }, [groupRefreshTrigger]);

  const handleJoinGroup = async (groupId) => {
    try {
      setJoinLoadingId(groupId);
      setError("");
      await api.post(`/groups/join/${groupId}`);
      await fetchGroups();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to join this group.");
    } finally {
      setJoinLoadingId("");
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    return groups.filter((group) =>
      group.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  const myGroupsCount = useMemo(() => {
    return groups.filter((group) =>
      group.members?.some((member) => {
        const memberId = typeof member === "string" ? member : member._id;
        return memberId === auth.user.id;
      })
    ).length;
  }, [auth.user.id, groups]);

  return (
    <main className="page-shell" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          {/* Page Header */}
          <section className="hero-card">
            <div>
              <span className="auth-badge" style={{ color: "#fff" }}>
                {auth.user.role === "teacher" ? "Teacher access" : "Student access"}
              </span>
              <h1>Study Circles</h1>
              <p className="tiny-text">Join or open a dedicated classroom chat</p>
              <div className="inline-actions" style={{ marginTop: "14px" }}>
                <Link className="btn-ghost" to="/home" title="Return to the public Home Feed page">
                  Back to Home Feed
                </Link>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <strong>{groups.length}</strong>
                <span>Total circles</span>
              </div>
              <div className="stat-card">
                <strong>{myGroupsCount}</strong>
                <span>Your circles</span>
              </div>
              <div className="stat-card">
                <strong>{auth.user.role === "teacher" ? "Teacher" : "Student"}</strong>
                <span>Account type</span>
              </div>
            </div>
          </section>

          {/* Main Groups Panel */}
          <section className="panel">
            <div className="section-top" style={{ marginBottom: "20px" }}>
              <div>
                <h2>Available Study Circles</h2>
                <p className="tiny-text">Search study circles by name or launch a brand new classroom circle</p>
              </div>
              <span className="pill neutral">{filteredGroups.length} circles</span>
            </div>

            {/* Tag & Keyword Search Bar and Create Circle CTA Button */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", marginBottom: "20px" }}>
              <div className="futuristic-search-container" style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-soft)", fontSize: "1.1rem" }}>🔍</span>
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search study circles by name..."
                  type="text"
                  value={searchQuery}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 44px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--surface-strong)",
                    fontSize: "0.95rem",
                    color: "var(--text)",
                  }}
                  title="Search and filter study circles dynamically by name"
                />
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0 24px",
                  height: "48px",
                  fontSize: "0.95rem",
                }}
                title="Open the modal to launch a brand new study circle"
              >
                <span>+</span>
                <span>Create Circle</span>
              </button>
            </div>

            <div className="stack stack--compact">
              {error ? <div className="error-banner">{error}</div> : null}
            </div>

            {/* Study circles grid list */}
            <div className="groups-grid">
              {loading ? <div className="info-banner">Loading study circles...</div> : null}
              {!loading && filteredGroups.length === 0 ? (
                <div className="empty-state">
                  {searchQuery ? "No study circles found matching your search." : "No study circles yet. Open the first circle!"}
                </div>
              ) : null}
              {!loading &&
                filteredGroups.map((group) => (
                  <GroupCard
                    currentUserId={auth.user.id}
                    group={group}
                    joinLoadingId={joinLoadingId}
                    key={group._id}
                    onJoin={handleJoinGroup}
                  />
                ))}
            </div>
          </section>
        </div>

      {/* Spacing for mobile layout alignment */}
      <div style={{ height: "40px" }}></div>
    </main>
  );
}
