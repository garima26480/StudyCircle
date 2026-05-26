import React, { useEffect, useMemo, useState } from "react";

import GroupCard from "../components/GroupCard";
import api from "../services/api";

function Home({ auth }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinLoadingId, setJoinLoadingId] = useState("");

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

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const handleCreateGroup = async (event) => {
    event.preventDefault();

    if (!groupName.trim()) {
      setCreateError("Group name is required.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      setCreateSuccess("");
      await api.post("/groups/create", { groupName: groupName.trim() });
      setGroupName("");
      setShowModal(false);
      setCreateSuccess("Group created successfully.");
      await fetchGroups();
    } catch (apiError) {
      setCreateError(apiError.response?.data?.message || "Unable to create group.");
    } finally {
      setCreating(false);
    }
  };

  const myGroupsCount = useMemo(() => {
    return groups.filter((group) =>
      group.members?.some((member) => {
        const memberId = typeof member === "string" ? member : member._id;
        return memberId === auth.user.id;
      })
    ).length;
  }, [auth.user.id, groups]);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <span className="auth-badge" style={{ color: "#fff" }}>
            {auth.user.role === "teacher" ? "Teacher access" : "Student access"}
          </span>
          <h1>Groups</h1>
          <div className="inline-actions">
            <button className="btn" onClick={() => setShowModal(true)} type="button">
              Create group
            </button>
            <button className="btn-ghost" onClick={fetchGroups} type="button">
              Refresh groups
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <strong>{groups.length}</strong>
            <span>Total groups</span>
          </div>
          <div className="stat-card">
            <strong>{myGroupsCount}</strong>
            <span>Your groups</span>
          </div>
          <div className="stat-card">
            <strong>{auth.user.role === "teacher" ? "Teacher" : "Student"}</strong>
            <span>Account type</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-top">
          <div>
            <h2>Available groups</h2>
          </div>
          <span className="pill neutral">{groups.length} groups</span>
        </div>

        <div className="stack stack--compact">
          <div className="info-banner">
            Signed in as <strong>{auth.user.name}</strong>
          </div>
          {createSuccess ? <div className="success-banner">{createSuccess}</div> : null}
          {error ? <div className="error-banner">{error}</div> : null}
        </div>

        <div className="groups-grid">
          {loading ? <div className="info-banner">Loading groups...</div> : null}
          {!loading && groups.length === 0 ? (
            <div className="empty-state">No groups yet. Create the first StudyCircle.</div>
          ) : null}
          {!loading &&
            groups.map((group) => (
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

      {showModal ? (
        <div className="modal-overlay" onClick={() => setShowModal(false)} role="presentation">
          <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="section-heading">
              <h2>Create a new group</h2>
            </div>

            <form className="form-grid" onSubmit={handleCreateGroup}>
              <div className="field">
                <label htmlFor="groupName">Group name</label>
                <input
                  id="groupName"
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Example: Data Structures Revision"
                  value={groupName}
                />
              </div>

              {createError ? <div className="error-banner">{createError}</div> : null}

              <div className="form-actions">
                <button className="btn" disabled={creating} type="submit">
                  {creating ? "Creating..." : "Create group"}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default Home;
