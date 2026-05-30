import React, { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { mergeUserProfile } from "../utils/profile";

function Login({ onLogin }) {
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!["student", "teacher"].includes(role)) {
    return <Navigate replace to="/" />;
  }

  const roleLabel = role === "teacher" ? "Teacher" : "Student";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data.user.role !== role) {
        setError(`This account belongs to the ${response.data.user.role} flow.`);
        return;
      }

      onLogin({
        ...response.data,
        user: mergeUserProfile(response.data.user),
      });
      navigate("/home");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-side">
          <div className="auth-copy">
            <span className="auth-badge">{roleLabel} access</span>
            <h1>StudyCircle</h1>
          </div>
        </section>

        <section className="auth-form-area">
          <div className="section-heading">
            <h2>{roleLabel} login</h2>
          </div>

          <form autoComplete="on" className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                autoComplete="username"
                id="email"
                inputMode="email"
                name="email"
                onChange={handleChange}
                placeholder="Enter your email"
                required
                type="email"
                value={formData.email}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="form-actions">
              <button className="btn" disabled={loading} type="submit">
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="link-row">
            <Link className="helper-link" to={`/register/${role}`}>
              {roleLabel} signup
            </Link>
          </div>

          <div className="link-row">
            <Link className="helper-link" to="/">
              Back to role selection
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
