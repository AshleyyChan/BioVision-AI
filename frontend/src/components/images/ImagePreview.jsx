import React from "react";

/**
 * ImagePreview
 * ------------
 * Fullscreen preview for a single image.
 *
 * Contract:
 * - `image` is a STRING (absolute or relative path)
 * - Purely presentational
 */
const ImagePreview = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Image preview"
          style={styles.image}
        />

        <button
          style={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    backgroundColor: "var(--bg-card)",
    padding: "16px",
    borderRadius: "8px",
    maxWidth: "80vw",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  image: {
    maxWidth: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
  },

  closeButton: {
    alignSelf: "flex-end",
    padding: "8px 14px",
    backgroundColor: "var(--primary)",
    color: "var(--text-inverse)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default React.memo(ImagePreview);
