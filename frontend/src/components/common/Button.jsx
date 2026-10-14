import React from "react";

/**
 * Button
 * ------
 * Reusable button component.
 *
 * Purpose:
 * - Provide a consistent button style across the application
 * - Support primary, secondary, and disabled states
 *
 * This component is purely presentational.
 */
const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary | secondary
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.base,
        ...(variant === "primary" ? styles.primary : styles.secondary),
        ...(disabled ? styles.disabled : {}),
      }}
    >
      {children}
    </button>
  );
};

/**
 * Styles
 */
const styles = {
  base: {
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    border: "none",
  },
  primary: {
    backgroundColor: "var(--primary)",
    color: "var(--text-inverse)",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "var(--text-main)",
    border: "1px solid var(--border)",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default Button;
