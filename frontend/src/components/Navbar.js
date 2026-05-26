import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="brand" state={{ transition: "back" }} to="/home">
          <div className="brand-mark">SC</div>

          <div className="brand-copy">
            <h2>StudyCircle</h2>

            <p>
              {location.pathname.startsWith("/group")
                ? "Shared chat and doubt space"
                : "Collaborative learning dashboard"}
            </p>
          </div>
        </Link>

        <div className="nav-actions">
          <span className="pill neutral">
            {user.name} • {user.role}
          </span>

          <button
            className="btn-danger"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;