import React from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";

/**
 * NotFound
 * --------
 * Fallback page for undefined routes.
 *
 * Purpose:
 * - Prevent blank screens
 * - Guide users back into the valid workflow
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Page Not Found</h2>
      <p style={styles.message}>
        The page you are trying to access does not exist.
      </p>

      <Button onClick={() => navigate("/welcome")}>
        Go to Welcome Page
      </Button>
    </div>
  );
};

/**
 * Styles
 */
const styles = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 600,
  },
  message: {
    color: "var(--text-muted)",
  },
};

export default NotFound;
