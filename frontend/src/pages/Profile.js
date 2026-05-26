import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ProfileAvatar from "../components/ProfileAvatar";
import api from "../services/api";
import {
  buildProfileUpdates,
  getProfileFormState,
  saveProfileForUser,
} from "../utils/profile";

function Profile({ auth, onUserUpdate }) {
  const [profileForm, setProfileForm] = useState(() => getProfileFormState(auth.user));
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setProfileForm(getProfileFormState(auth.user));
  }, [auth.user]);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoadingGroups(true);
        setGroupsError("");
        const response = await api.get("/groups");
        setGroups(response.data);
      } catch (apiError) {
        setGroupsError(apiError.response?.data?.message || "Unable to load your groups.");
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, []);

  const createdGroups = useMemo(() => {
    return groups.filter((group) => group.createdBy?._id === auth.user.id);
  }, [auth.user.id, groups]);

  const joinedGroups = useMemo(() => {
    return groups.filter((group) =>
      group.members?.some((member) => {
        const memberId = typeof member === "string" ? member : member._id;
        return memberId === auth.user.id;
      })
    );
  }, [auth.user.id, groups]);

  const previewUser = useMemo(() => {
    const updates = buildProfileUpdates(auth.user, profileForm);
    const mergedUser = {
      ...auth.user,
      ...updates,
    };

    return {
      ...mergedUser,
      displayName: updates.ghostMode ? auth.user.ghostId : updates.name || auth.user.name,
      semYear:
        auth.user.role === "teacher"
          ? "Faculty"
          : [updates.semester ? `Semester ${updates.semester}` : "", updates.year ? `Year ${updates.year}` : ""]
              .filter(Boolean)
              .join(" | "),
    };
  }, [auth.user, profileForm]);

  const handleChange = (event) => {
    const { checked, name, value, type } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaveMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    const updates = buildProfileUpdates(auth.user, profileForm);
    const nextUser = saveProfileForUser(auth.user, updates);
    onUserUpdate(nextUser);
    setSaveMessage("Profile preferences saved on this device.");
  };

  return (
    <main className="page-shell">
      <div className="inline-actions" style={{ marginBottom: "18px" }}>
        <Link className="btn-ghost" state={{ transition: "back" }} to="/home">
          Back to home
        </Link>
      </div>

      <section className="hero-card profile-hero">
        <div className="profile-hero__identity">
          <ProfileAvatar size="xl" user={previewUser} />
          <div className="profile-hero__copy">
            <span className={`pill ${previewUser.ghostMode ? "warm" : "neutral"}`}>
              {previewUser.ghostMode ? "Ghost mode on" : "Profile visible"}
            </span>
            <h1>{previewUser.displayName}</h1>
            <div className="profile-tags">
              {previewUser.department ? <span className="pill">{previewUser.department}</span> : null}
              {previewUser.semYear ? <span className="pill neutral">{previewUser.semYear}</span> : null}
              {previewUser.role === "teacher" && previewUser.subjects ? (
                <span className="pill neutral">{previewUser.subjects}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <strong>{createdGroups.length}</strong>
            <span>Created groups</span>
          </div>
          <div className="stat-card">
            <strong>{joinedGroups.length}</strong>
            <span>Joined groups</span>
          </div>
          <div className="stat-card">
            <strong>{previewUser.languages.length}</strong>
            <span>Languages</span>
          </div>
        </div>
      </section>

      <section className="profile-layout">
        <section className="panel">
          <div className="section-heading">
            <h2>Public view</h2>
          </div>

          <div className="profile-overview">
            <div className="profile-overview__row">
              <span>Name</span>
              <strong>{previewUser.displayName}</strong>
            </div>
            <div className="profile-overview__row">
              <span>Department</span>
              <strong>{previewUser.department || "Not set"}</strong>
            </div>
            <div className="profile-overview__row">
              <span>Sem / Year</span>
              <strong>{previewUser.semYear || "Not set"}</strong>
            </div>
            {!previewUser.ghostMode ? (
              <>
                <div className="profile-overview__row">
                  <span>Email</span>
                  <strong>{previewUser.email}</strong>
                </div>
                <div className="profile-overview__row">
                  <span>Instagram</span>
                  <strong>{previewUser.instaId || "Not added"}</strong>
                </div>
                <div className="profile-overview__row">
                  <span>Languages</span>
                  <strong>
                    {previewUser.languages.length ? previewUser.languages.join(", ") : "Not added"}
                  </strong>
                </div>
              </>
            ) : null}
          </div>

          <div className="stack" style={{ marginTop: "18px" }}>
            <div className="panel" style={{ padding: "18px" }}>
              <h3 style={{ marginTop: 0 }}>Created groups</h3>
              {loadingGroups ? <p className="meta-text">Loading groups...</p> : null}
              {!loadingGroups && !createdGroups.length ? (
                <p className="meta-text">No groups created yet.</p>
              ) : null}
              <div className="profile-group-list">
                {createdGroups.map((group) => (
                  <span className="pill neutral" key={group._id}>
                    {group.groupName}
                  </span>
                ))}
              </div>
            </div>

            <div className="panel" style={{ padding: "18px" }}>
              <h3 style={{ marginTop: 0 }}>Joined groups</h3>
              {loadingGroups ? <p className="meta-text">Loading groups...</p> : null}
              {!loadingGroups && !joinedGroups.length ? (
                <p className="meta-text">No joined groups yet.</p>
              ) : null}
              <div className="profile-group-list">
                {joinedGroups.map((group) => (
                  <span className="pill" key={group._id}>
                    {group.groupName}
                  </span>
                ))}
              </div>
            </div>

            {groupsError ? <div className="error-banner">{groupsError}</div> : null}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>Edit profile</h2>
          </div>

          <form className="form-grid two-column" onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                onChange={handleChange}
                placeholder="Your full name"
                value={profileForm.name}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input disabled id="email" name="email" type="email" value={profileForm.email} />
            </div>

            <div className="field">
              <label htmlFor="profilePicture">Profile picture URL</label>
              <input
                id="profilePicture"
                name="profilePicture"
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                value={profileForm.profilePicture}
              />
            </div>

            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                onChange={handleChange}
                placeholder="CSE, ISE, ECE..."
                value={profileForm.department}
              />
            </div>

            {auth.user.role === "teacher" ? (
              <div className="field">
                <label htmlFor="subjects">Subjects</label>
                <input
                  id="subjects"
                  name="subjects"
                  onChange={handleChange}
                  placeholder="DBMS, Networks, OS"
                  value={profileForm.subjects}
                />
              </div>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="year">Year</label>
                  <input
                    id="year"
                    name="year"
                    onChange={handleChange}
                    placeholder="1, 2, 3, 4"
                    value={profileForm.year}
                  />
                </div>

                <div className="field">
                  <label htmlFor="semester">Semester</label>
                  <input
                    id="semester"
                    name="semester"
                    onChange={handleChange}
                    placeholder="1, 2, 3..."
                    value={profileForm.semester}
                  />
                </div>
              </>
            )}

            <div className="field">
              <label htmlFor="instaId">Instagram ID</label>
              <input
                id="instaId"
                name="instaId"
                onChange={handleChange}
                placeholder="@yourhandle"
                value={profileForm.instaId}
              />
            </div>

            <div className="field">
              <label htmlFor="languages">Languages</label>
              <input
                id="languages"
                name="languages"
                onChange={handleChange}
                placeholder="English, Hindi, Kannada"
                value={profileForm.languages}
              />
            </div>

            <label className="toggle-field" htmlFor="ghostMode">
              <input
                checked={profileForm.ghostMode}
                id="ghostMode"
                name="ghostMode"
                onChange={handleChange}
                type="checkbox"
              />
              <span>
                <strong>Ghost mode</strong>
              </span>
            </label>

            {saveMessage ? <div className="success-banner">{saveMessage}</div> : null}

            <div className="form-actions">
              <button className="btn" type="submit">
                Save profile
              </button>
              <Link className="btn-ghost" state={{ transition: "back" }} to="/home">
                Done
              </Link>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default Profile;
