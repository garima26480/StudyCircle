import React from "react";
import { Link } from "react-router-dom";

const AccountIcon = ({ role }) => (
  <svg
    aria-hidden="true"
    className="landing-option__icon"
    fill="none"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="32" cy="32" fill={role === "teacher" ? "#dbeafe" : "#dcfce7"} r="30" />
    <circle cx="32" cy="24" fill={role === "teacher" ? "#2563eb" : "#16a34a"} r="10" />
    <path
      d="M18 48c2.4-8 8.4-12 14-12s11.6 4 14 12"
      fill={role === "teacher" ? "#2563eb" : "#16a34a"}
    />
    {role === "teacher" ? (
      <path
        d="M18 22l14-6 14 6-14 6-14-6Zm4 4v8c4.2 3.5 15.8 3.5 20 0v-8"
        fill="#1d4ed8"
      />
    ) : null}
  </svg>
);

function Landing() {
  return (
    <main className="auth-shell landing-shell">
      <section className="landing-card">
        <div className="section-heading landing-heading">
          <h1>Please select your account type</h1>
        </div>

        <div className="landing-grid">
          <Link className="landing-option" state={{ transition: "forward" }} to="/login/student">
            <div className="landing-option__box">
              <AccountIcon role="student" />
            </div>
            <span className="landing-option__label">Student</span>
          </Link>

          <Link className="landing-option" state={{ transition: "forward" }} to="/login/teacher">
            <div className="landing-option__box">
              <AccountIcon role="teacher" />
            </div>
            <span className="landing-option__label">Teacher</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Landing;
