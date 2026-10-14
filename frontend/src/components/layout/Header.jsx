import React from "react";

/**
 * Header
 * ------
 * Top header shown ONLY after entering the workflow.
 *
 * Displays:
 * - Research lab name (primary)
 * - Institute name (secondary)
 *
 * Centered, bold, academic style
 */
const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.center}>
        <h1 style={styles.title}>
          Molecular Biology and Stem Cell Research Lab
        </h1>
        <p style={styles.subtitle}>
          Sathyabama Institute of Science and Technology
        </p>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: "#020617",          // deep academic dark
    borderBottom: "1px solid #1e293b",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    textAlign: "center",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,                     // bold
    color: "#ffffff",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    marginTop: "4px",
    fontSize: "14px",
    fontWeight: 600,                     // bold but smaller
    color: "#e5e7eb",
  },
};

export default Header;
