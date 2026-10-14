import React from "react";

/**
 * Input
 * -----
 * Reusable input field component.
 *
 * Purpose:
 * - Standardize input styling across the application
 * - Reduce duplication of input styles
 *
 * This component is presentational only.
 */
const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        ...styles.input,
        ...(disabled ? styles.disabled : {}),
      }}
    />
  );
};

/**
 * Styles
 */
const styles = {
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    fontSize: "14px",
    width: "100%",
  },
  disabled: {
    backgroundColor: "#f1f5f9",
    cursor: "not-allowed",
  },
};

export default Input;
