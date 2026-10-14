import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * AppLayout
 * ----------
 * Application UI shell shown ONLY after "Get Started".
 *
 * Responsibilities:
 * - Sidebar navigation
 * - Contextual header
 * - Scrollable main content area
 *
 * Notes:
 * - NOT used on Welcome page
 * - No business logic
 * - No API calls
 */
const AppLayout = () => {
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div style={styles.main}>
        {/* Header */}
        <Header />

        {/* Routed page content */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/**
 * Layout styles — dark, stable, app-like
 */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    backgroundColor: "var(--bg-main)",
    overflow: "hidden",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  content: {
    flex: 1,
    padding: "28px 36px",
    overflowY: "auto",
    backgroundColor: "var(--bg-main)",
  },
};

export default AppLayout;
