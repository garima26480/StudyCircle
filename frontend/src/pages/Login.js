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
              <input
                autoComplete="current-password"
                id="password"
                name="password"
                onChange={handleChange}
                placeholder="Enter your password"
                required
                type="password"
                value={formData.password}
              />
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
