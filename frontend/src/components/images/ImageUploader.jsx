import React, { useRef } from "react";

/**
 * ImageUploader
 * -------------
 * Upload component for SINGLE specimen images.
 *
 * Responsibilities:
 * - Click or drag-and-drop upload
 * - Delegate file handling to parent
 *
 * ❌ No upload logic
 * ❌ No backend calls
 */
const ImageUploader = ({ onUpload, disabled = false }) => {
  const fileInputRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /* Input change                                                       */
  /* ------------------------------------------------------------------ */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload([file]);
  };

  /* ------------------------------------------------------------------ */
  /* Drag & drop                                                        */
  /* ------------------------------------------------------------------ */
  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) onUpload([file]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /* ------------------------------------------------------------------ */
  /* Open file dialog                                                   */
  /* ------------------------------------------------------------------ */
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.dropzone,
          ...(disabled ? styles.disabled : {}),
        }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p style={styles.text}>
          Click to upload or drag & drop an image
        </p>

        <p style={styles.subtext}>
          Supported formats: JPG, PNG, TIFF
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  container: {
    width: "100%",
  },

  dropzone: {
    border: "2px dashed var(--border)",
    borderRadius: "8px",
    padding: "24px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "var(--bg-card)",
  },

  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  text: {
    fontSize: "14px",
    fontWeight: 500,
  },

  subtext: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
};

export default React.memo(ImageUploader);
