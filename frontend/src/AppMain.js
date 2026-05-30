import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import PageTransition from "./components/PageTransition";
import StudyNavbar from "./components/StudyNavbar";
import Group from "./pages/Group";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import GroupsList from "./pages/GroupsList";
import { LayoutProvider, useLayout } from "./components/LayoutContext";
import BottomNavCard from "./components/BottomNavCard";
import SidebarMenu from "./components/SidebarMenu";
import DynamicSkyBackground from "./components/DynamicSkyBackground";
import api from "./services/api";
import "./App.css";
import { mergeUserProfile } from "./utils/profile";

const getStoredUser = () => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return mergeUserProfile(JSON.parse(rawUser));
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
};

const GlobalCreateModal = () => {
  const { setShowCreateModal, triggerGroupRefresh } = useLayout();
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleCreateGroup = async (event) => {
    event.preventDefault();

    if (!groupName.trim()) {
      setCreateError("Group name is required.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      await api.post("/groups/create", { groupName: groupName.trim() });
      setGroupName("");
      setShowCreateModal(false);
      triggerGroupRefresh(); // Automatically refreshes groups lists on any page
    } catch (apiError) {
      setCreateError(apiError.response?.data?.message || "Unable to create group.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div 
      className="modal-overlay" 
      onClick={() => setShowCreateModal(false)} 
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <motion.div 
        className="modal-card" 
        onClick={(event) => event.stopPropagation()} 
        role="dialog"
        initial={{ scale: 0.9, y: 25, opacity: 0 }}
        animate={{ 
          scale: 1, 
          y: 0, 
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 24 } // Premium spring physics bounce
        }}
        exit={{ 
          scale: 0.9, 
          y: 15, 
          opacity: 0,
          transition: { duration: 0.18, ease: "easeIn" }
        }}
      >
        <div className="section-heading">
          <h2>Create a new study circle</h2>
        </div>

        <form className="form-grid" onSubmit={handleCreateGroup}>
          <div className="field">
            <label htmlFor="groupName">Circle / Group Name</label>
            <input
              id="groupName"
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Example: Calculus 101, German B1"
              value={groupName}
            />
          </div>

          {createError ? <div className="error-banner">{createError}</div> : null}

          <div className="form-actions">
            <button className="btn" disabled={creating} type="submit">
              {creating ? "Creating..." : "Create Circle"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => setShowCreateModal(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Router Helper Component to capture browser location hooks
function AppContent({ auth, handleLogout, handleLogin, handleUserUpdate, ProtectedRoute }) {
  const location = useLocation();
  const { showCreateModal } = useLayout();

  return (
    <div className="app-shell">
      <DynamicSkyBackground />
      {auth.user ? <StudyNavbar onLogout={handleLogout} user={auth.user} /> : null}
      {auth.user ? <SidebarMenu onLogout={handleLogout} user={auth.user} /> : null}
      {auth.user ? <BottomNavCard /> : null}
      
      {/* Spring bounce dialog modal entries */}
      <AnimatePresence>
        {showCreateModal ? <GlobalCreateModal /> : null}
      </AnimatePresence>
      
      {/* Page exit / entry transition orchestrator */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            element={
              auth.token ? (
                <Navigate replace to="/home" />
              ) : (
                <PageTransition fallback="fade">
                  <Landing />
                </PageTransition>
              )
            }
            path="/"
          />
          <Route
            element={
              auth.token ? (
                <Navigate replace to="/home" />
              ) : (
                <PageTransition fallback="fade">
                  <Login onLogin={handleLogin} />
                </PageTransition>
              )
            }
            path="/login/:role"
          />
          <Route
            element={
              auth.token ? (
                <Navigate replace to="/home" />
              ) : (
                <PageTransition fallback="fade">
                  <Register onRegister={handleLogin} />
                </PageTransition>
              )
            }
            path="/register/:role"
          />
          <Route
            element={
              <ProtectedRoute>
                <PageTransition fallback="back">
                  <Home auth={auth} onLogout={handleLogout} />
                </PageTransition>
              </ProtectedRoute>
            }
            path="/home"
          />
          <Route
            element={
              <ProtectedRoute>
                <PageTransition fallback="forward">
                  <GroupsList auth={auth} onLogout={handleLogout} />
                </PageTransition>
              </ProtectedRoute>
            }
            path="/groups"
          />
          <Route
            element={
              <ProtectedRoute>
                <PageTransition fallback="forward">
                  <Group auth={auth} />
                </PageTransition>
              </ProtectedRoute>
            }
            path="/group/:id"
          />
          <Route
            element={
              <ProtectedRoute>
                <PageTransition fallback="forward">
                  <Profile auth={auth} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
                </PageTransition>
              </ProtectedRoute>
            }
            path="/profile"
          />
          <Route element={<Navigate replace to={auth.token ? "/home" : "/"} />} path="*" />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function AppMain() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || "",
    user: getStoredUser(),
  });

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("token", auth.token);
    } else {
      localStorage.removeItem("token");
    }

    if (auth.user) {
      localStorage.setItem("user", JSON.stringify(auth.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [auth]);

  const handleLogin = ({ token, user }) => {
    setAuth({ token, user: mergeUserProfile(user) });
  };

  const handleLogout = () => {
    setAuth({ token: "", user: null });
  };

  const handleUserUpdate = (user) => {
    setAuth((prev) => ({
      ...prev,
      user: mergeUserProfile(user),
    }));
  };

  const ProtectedRoute = ({ children }) => {
    if (!auth.token || !auth.user) {
      return <Navigate replace to="/" />;
    }

    return children;
  };

  return (
    <LayoutProvider>
      <BrowserRouter>
        <AppContent 
          auth={auth}
          handleLogout={handleLogout}
          handleLogin={handleLogin}
          handleUserUpdate={handleUserUpdate}
          ProtectedRoute={ProtectedRoute}
        />
      </BrowserRouter>
    </LayoutProvider>
  );
}

export default AppMain;