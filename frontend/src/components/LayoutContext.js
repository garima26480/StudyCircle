import React, { createContext, useContext, useEffect, useState } from "react";

const LayoutContext = createContext(null);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

export function LayoutProvider({ children }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupRefreshTrigger, setGroupRefreshTrigger] = useState(0);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const triggerGroupRefresh = () => {
    setGroupRefreshTrigger((prev) => prev + 1);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleSidebarMenu = () => {
    setShowSidebarMenu((prev) => !prev);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("theme-dark-vibrant");
      root.classList.remove("theme-light-vibrant");
    } else {
      root.classList.add("theme-light-vibrant");
      root.classList.remove("theme-dark-vibrant");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <LayoutContext.Provider
      value={{
        showCreateModal,
        setShowCreateModal,
        groupRefreshTrigger,
        triggerGroupRefresh,
        theme,
        toggleTheme,
        isDarkMode: theme === "dark",
        showSidebarMenu,
        setShowSidebarMenu,
        toggleSidebarMenu,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
