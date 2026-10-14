import React from "react";

/**
 * Loader
 * ------
 * Global loading indicator.
 *
 * Purpose:
 * - Communicate background activity subtly
 * - Maintain calm, non-distracting UI feedback
 */
const Loader = () => {
  return (
    <div style={styles.container}>
      <div style={styles.ring} />
      <span style={styles.text}>Loading</span>

      {/* local animation */}
      <style>
        {`
          @keyframes softSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = {
  container: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 8px",
  },

  ring: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.15)",
    borderTopColor: "var(--primary)",
    animation: "softSpin 0.9s linear infinite",
  },

  text: {
    fontSize: "13px",
    color: "var(--text-muted)",
    letterSpacing: "0.2px",
  },
};
