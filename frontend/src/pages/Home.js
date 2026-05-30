import React, { useEffect, useState } from "react";
import api from "../services/api";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function Home({ auth, onLogout }) {
  // Public Feed Portal States
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postSubject, setPostSubject] = useState("");
  const [postLanguage, setPostLanguage] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postError, setPostError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      setPostError("");
      const response = await api.get("/public-posts");
      setPosts(response.data);
    } catch (apiError) {
      setPostError(apiError.response?.data?.message || "Unable to fetch public posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!postContent.trim()) {
      setPostError("Post content is required.");
      return;
    }

    if (!postSubject.trim()) {
      setPostError("Subject is required.");
      return;
    }

    try {
      setSubmittingPost(true);
      setPostError("");
      const response = await api.post("/public-posts", {
        content: postContent.trim(),
        subject: postSubject.trim(),
        language: postLanguage.trim(),
      });
      setPostContent("");
      setPostSubject("");
      setPostLanguage("");
      // Prepend to the feed list dynamically
      setPosts((prev) => [response.data, ...prev]);
    } catch (apiError) {
      setPostError(apiError.response?.data?.message || "Unable to create post.");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await api.post(`/public-posts/like/${postId}`);
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? response.data : post))
      );
    } catch (apiError) {
      console.error("Unable to like post:", apiError);
    }
  };

  return (
    <main className="page-shell" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "28px 24px" }}>
      <div className="feed-dashboard-grid">
        {/* Center: Main Dashboard Feed Stream */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
          {/* Feed Page Header */}
          <section className="hero-card">
            <div>
              <span className="auth-badge" style={{ color: "#fff" }}>
                {auth.user.role === "teacher" ? "Teacher access" : "Student access"}
              </span>
              <h1>Home Feed</h1>
              <p className="tiny-text">Share subject updates and language info with everyone</p>
            </div>

            <div className="hero-stats two-cols">
              <div className="stat-card">
                <strong>{posts.length}</strong>
                <span>Public posts</span>
              </div>
              <div className="stat-card">
                <strong>{auth.user.name.split(" ")[0]}</strong>
                <span>Signed in</span>
              </div>
            </div>
          </section>

          {/* Public Portal Panel Feed */}
          <section className="panel">
            <div className="section-top">
              <div>
                <h2>Public Portal</h2>
                <p className="tiny-text">What's new in your subjects or languages?</p>
              </div>
              <span className="pill">{posts.length} posts</span>
            </div>

            {/* Twitter Composer Box */}
            <form className="composer-card" onSubmit={handleCreatePost} style={{ display: "grid", gap: "14px", padding: "18px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-strong)", marginBottom: "20px" }}>
              <div className="field">
                <label htmlFor="postContent" style={{ display: "none" }}>Share something...</label>
                <textarea
                  id="postContent"
                  maxLength={280}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's interesting about a subject or language? Share with everyone..."
                  required
                  style={{ minHeight: "80px", border: "none", borderBottom: "1px solid var(--border)", background: "transparent", resize: "none", padding: "8px 0" }}
                  value={postContent}
                  title="Write your public update (up to 280 characters)"
                />
                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.85rem", color: postContent.length > 250 ? "var(--danger)" : "var(--text-soft)", margin: "-4px 0 8px" }}>
                  {postContent.length}/280
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field">
                  <label htmlFor="postSubject" style={{ fontSize: "0.9rem", fontWeight: "600" }}>Subject *</label>
                  <input
                    id="postSubject"
                    onChange={(e) => setPostSubject(e.target.value)}
                    placeholder="e.g. DBMS, OS, Python"
                    required
                    style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "0.9rem" }}
                    value={postSubject}
                    title="Tag this post with a subject name (required)"
                  />
                </div>
                <div className="field">
                  <label htmlFor="postLanguage" style={{ fontSize: "0.9rem", fontWeight: "600" }}>Language</label>
                  <input
                    id="postLanguage"
                    onChange={(e) => setPostLanguage(e.target.value)}
                    placeholder="e.g. English, Spanish, None"
                    style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "0.9rem" }}
                    value={postLanguage}
                    title="Tag this post with a language name (optional)"
                  />
                </div>
              </div>

              {postError ? <div className="error-banner" style={{ padding: "8px 12px", fontSize: "0.85rem" }}>{postError}</div> : null}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                <button className="btn" disabled={submittingPost || !postContent.trim() || !postSubject.trim()} type="submit" style={{ padding: "8px 20px", fontSize: "0.9rem" }} title="Publish this update to the public Home Feed">
                  {submittingPost ? "Posting..." : "Post"}
                </button>
              </div>
            </form>

            {/* Public Tweets Streams List */}
            <div className="activity-grid">
              {loadingPosts ? <div className="info-banner">Loading portal posts...</div> : null}
              {!loadingPosts && posts.length === 0 ? (
                <div className="empty-state">No public posts yet. Be the first to share!</div>
              ) : null}
              {!loadingPosts &&
                posts.map((post) => {
                  const userInitials = post.userId?.name
                    ? post.userId.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "U";
                  const isLiked = post.likes?.includes(auth.user.id);
                  const timeAgo = formatTimeAgo(post.createdAt);

                  return (
                    <article key={post._id} className="feed-card" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "14px", padding: "16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface)", marginBottom: "12px" }}>
                      {/* User profile initials avatar */}
                      <div className="profile-avatar-shell profile-avatar-shell--md" style={{ background: post.userId?.role === "teacher" ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "linear-gradient(135deg, var(--accent), #db2777)", color: "#ffffff", fontWeight: "700" }} title={`${post.userId?.name || "Deleted User"} (${post.userId?.role === "teacher" ? "Teacher" : "Student"})`}>
                        {userInitials}
                      </div>

                      <div style={{ display: "grid", gap: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                          <div>
                            <strong style={{ fontSize: "0.95rem" }}>{post.userId?.name || "Deleted User"}</strong>
                            <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "999px", background: "rgba(139, 92, 246, 0.08)", color: "var(--primary-dark)", fontWeight: "700", marginLeft: "8px" }}>
                              {post.userId?.role === "teacher" ? "Teacher" : "Student"}
                            </span>
                          </div>
                          <span className="tiny-text" style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>{timeAgo}</span>
                        </div>

                        <p style={{ margin: "4px 0", fontSize: "0.95rem", lineHeight: "1.5" }}>{post.content}</p>

                        {/* Subject and Language Neon Tags */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "4px 0" }}>
                          <span className="pill" style={{ fontSize: "0.8rem", padding: "2px 10px", background: "rgba(139, 92, 246, 0.08)", color: "var(--primary)", fontWeight: "700" }}>
                            #{post.subject}
                          </span>
                          {post.language ? (
                            <span className="pill warm" style={{ fontSize: "0.8rem", padding: "2px 10px", background: "rgba(236, 72, 153, 0.12)", color: "#db2777", fontWeight: "700" }}>
                              #{post.language}
                            </span>
                          ) : null}
                        </div>

                        {/* Interactive Heart Like Button */}
                        <div style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
                          <button
                            onClick={() => handleLikePost(post._id)}
                            style={{ background: "none", border: "none", color: isLiked ? "#e11d48" : "var(--text-soft)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "transform 0.15s ease", outline: "none", padding: "4px" }}
                            type="button"
                            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            title={isLiked ? "Unlike this post" : "Like this post"}
                          >
                            <svg
                              fill={isLiked ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: isLiked ? "#e11d48" : "var(--text-soft)" }}>
                              {post.likes?.length || 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        </div>

        {/* Right Side: Trending Feed Tags & Guidelines */}
        <div className="utility-panel-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Trending Topics Widget */}
          <section className="panel" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "1.1rem", fontWeight: "800", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              🔥 Trending Tags
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="pill">#DBMS</span>
                <span className="tiny-text">14 posts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="pill">#OS</span>
                <span className="tiny-text">9 posts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="pill">#Python</span>
                <span className="tiny-text">12 posts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="pill warm">#German</span>
                <span className="tiny-text">8 posts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="pill warm">#Spanish</span>
                <span className="tiny-text">5 posts</span>
              </div>
            </div>
          </section>

          {/* Guidelines */}
          <section className="panel" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "1.1rem", fontWeight: "800", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              💡 Quick Guidelines
            </h3>
            <ul style={{ paddingLeft: "18px", margin: 0, display: "grid", gap: "10px", fontSize: "0.9rem", color: "var(--text-soft)" }}>
              <li>Share relevant educational insights</li>
              <li>Tag with subjects for better reach</li>
              <li>Ask direct questions to start conversations</li>
              <li>Help others resolve doubts in comments</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Spacing for mobile layout alignment */}
      <div style={{ height: "40px" }}></div>
    </main>
  );
}
