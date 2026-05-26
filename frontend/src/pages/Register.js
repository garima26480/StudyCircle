import React, { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import {
  buildProfileOverridesFromRegister,
  buildRegisterPayload,
  mergeUserProfile,
  sanitizeStudentId,
  saveProfileOverrides,
} from "../utils/profile";

const initialFormState = {
  name: "",
  department: "",
  subjects: "",
  email: "",
  password: "",
  studentId: "",
  year: "",
  semester: "",
};

function Register({ onRegister }) {
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!["student", "teacher"].includes(role)) {
    return <Navigate replace to="/" />;
  }

  const roleLabel = role === "teacher" ? "Teacher" : "Student";

  const roleSummary =
    role === "teacher"
      ? "Creates open groups with unlimited members."
      : "Creates student groups with up to 10 members.";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "studentId" ? sanitizeStudentId(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = buildRegisterPayload(role, formData);
      const response = await api.post("/auth/register", payload);
      const overrides = buildProfileOverridesFromRegister(role, formData, payload);

      saveProfileOverrides(payload.email, overrides);

      onRegister({
        ...response.data,
        user: mergeUserProfile(response.data.user),
      });
      navigate("/home");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-side">
          <div className="auth-copy">
            <span className="auth-badge">{roleLabel} signup</span>
            <h1>Create your StudyCircle account</h1>
          </div>
        </section>

        <section className="auth-form-area">
          <div className="section-heading">
            <h2>{roleLabel} signup</h2>
          </div>

          <form autoComplete="on" className="form-grid two-column" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                autoComplete="name"
                id="name"
                name="name"
                onChange={handleChange}
                placeholder="Your full name"
                required
                value={formData.name}
              />
            </div>

            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                autoComplete="organization"
                id="department"
                name="department"
                onChange={handleChange}
                placeholder="CSE, ISE, ECE..."
                required
                value={formData.department}
              />
            </div>

            {role === "teacher" ? (
              <div className="field">
                <label htmlFor="subjects">Subjects</label>
                <input
                  id="subjects"
                  name="subjects"
                  onChange={handleChange}
                  placeholder="DBMS, OS, Networks"
                  required
                  value={formData.subjects}
                />
              </div>
            ) : (
              <div className="field">
                <label htmlFor="studentId">SRN / USN</label>
                <input
                  id="studentId"
                  name="studentId"
                  onChange={handleChange}
                  placeholder="PES2UG22CS001"
                  required
                  value={formData.studentId}
                />
              </div>
            )}

            {role === "student" ? (
              <>
                <div className="field">
                  <label htmlFor="year">Year</label>
                  <input
                    id="year"
                    name="year"
                    onChange={handleChange}
                    placeholder="1, 2, 3, 4"
                    required
                    value={formData.year}
                  />
                </div>

                <div className="field">
                  <label htmlFor="semester">Semester</label>
                  <input
                    id="semester"
                    name="semester"
                    onChange={handleChange}
                    placeholder="1, 2, 3..."
                    required
                    value={formData.semester}
                  />
                </div>
              </>
            ) : null}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                autoComplete="username"
                id="email"
                inputMode="email"
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                required
                type="email"
                value={formData.email}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                autoComplete="new-password"
                id="password"
                name="password"
                onChange={handleChange}
                placeholder="Choose a secure password"
                required
                type="password"
                value={formData.password}
              />
            </div>

            <div className="field">
              <label htmlFor="roleSummary">Account summary</label>
              <input disabled id="roleSummary" value={roleSummary} />
            </div>

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="form-actions">
              <button className="btn" disabled={loading} type="submit">
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <div className="link-row">
            <Link className="helper-link" to={`/login/${role}`}>
              {roleLabel} login
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

export default Register;
