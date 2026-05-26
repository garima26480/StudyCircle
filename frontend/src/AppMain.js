import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import PageTransition from "./components/PageTransition";
import StudyNavbar from "./components/StudyNavbar";
import Group from "./pages/Group";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
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
    <BrowserRouter>
      <div className="app-shell">
        {auth.user ? <StudyNavbar onLogout={handleLogout} user={auth.user} /> : null}
        <Routes>
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
                  <Home auth={auth} />
                </PageTransition>
              </ProtectedRoute>
            }
            path="/home"
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
                  <Profile auth={auth} onUserUpdate={handleUserUpdate} />
                </PageTransition>
              </ProtectedRoute>
            }
            path="/profile"
          />
          <Route element={<Navigate replace to={auth.token ? "/home" : "/"} />} path="*" />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppMain;