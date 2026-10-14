import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Sidebar
 * -------
 * Primary navigation shown after "Get Started".
 *
 * Navigation:
 * - Study → Study Manager & Workspaces
 * - Image Comparison → Compare specimen images
 * - Formulas → Scientific formulas & chemicals
 * - About Us → Research lab information
 */
const Sidebar = () => {
  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <NavLink to="/" style={styles.brandLink}>
        <div style={styles.brand}>
          <div style={styles.logo}>BioVision AI</div>
          <div style={styles.tagline}>Research Platform</div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav style={styles.nav}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.active : {}),
          })}
        >
          <span style={styles.icon}>📊</span>
          Overview
        </NavLink>

        <NavLink
          to="/studies"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.active : {}),
          })}
        >
          <span style={styles.icon}>🧪</span>
          Studies
        </NavLink>

        <NavLink
          to="/image-compare"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.active : {}),
          })}
        >
          <span style={styles.icon}>🔍</span>
          Image Comparison
        </NavLink>

        <NavLink
          to="/formulas"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.active : {}),
          })}
        >
          <span style={styles.icon}>📐</span>
          Formulas
        </NavLink>

        <NavLink
          to="/about"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.active : {}),
          })}
        >
          <span style={styles.icon}>🏛️</span>
          About Us
        </NavLink>
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 280,
    backgroundColor: "#020617",
    color: "#f8fafc",
    padding: "36px 22px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #1e293b",
  },

  brandLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },

  brand: {
    marginBottom: "52px",
    cursor: "pointer",
  },

  logo: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "-0.4px",
  },

  tagline: {
    fontSize: "14px",
    color: "#cbd5f5",
    marginTop: "6px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 500,
    transition: "background-color 0.2s ease, color 0.2s ease",
  },

  icon: {
    fontSize: "18px",
    lineHeight: 1,
  },

  active: {
    backgroundColor: "rgba(99,102,241,0.22)",
    color: "#ffffff",
    fontWeight: 600,
  },
};

export default Sidebar;
