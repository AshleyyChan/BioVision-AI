import React from "react";

import Modal from "../common/Modal";
import Button from "../common/Button";

/**
 * ConfirmDeleteSpecimenModal
 * --------------------------
 * Explicit confirmation dialog for destructive specimen deletion.
 *
 * Visual language MUST match ConfirmDeleteModal (study).
 */
const ConfirmDeleteSpecimenModal = ({
  specimen,
  onConfirm,
  onCancel,
}) => {
  if (!specimen) return null;

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal isOpen onClose={handleCancel}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.accent} />
          <h3 style={styles.title}>Delete Specimen</h3>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <p style={styles.text}>
            You are about to permanently delete the following specimen:
          </p>

          <p style={styles.specimenName}>
            {specimen.name || "Unnamed Specimen"}
          </p>

          <p style={styles.warning}>
            This action cannot be undone. All associated days and analysis
            data will be permanently removed.
          </p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <Button
            variant="secondary"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            type="button"
            onClick={handleConfirm}
          >
            Delete Specimen
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ConfirmDeleteSpecimenModal);

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = {
  container: {
    width: "500px",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },

  accent: {
    width: "3px",
    height: "22px",
    borderRadius: "2px",
    backgroundColor: "#ef4444",
  },

  title: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: "0.2px",
  },

  /* Body */
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  text: {
    fontSize: "14px",
    color: "#cbd5f5",
  },

  specimenName: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#ffffff",
    marginTop: "2px",
    wordBreak: "break-word",
  },

  warning: {
    fontSize: "13px",
    color: "#fca5a5",
    marginTop: "6px",
  },

  /* Footer */
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "14px",
    width: "100%",
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },
};
