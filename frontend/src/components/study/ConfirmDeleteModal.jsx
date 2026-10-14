import Modal from "../common/Modal";
import Button from "../common/Button";

/**
 * ConfirmDeleteModal
 * ------------------
 * Explicit confirmation dialog for destructive study deletion.
 */
const ConfirmDeleteModal = ({
  title = "Untitled Study",
  onConfirm,
  onCancel,
}) => {
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
          <h3 style={styles.title}>Delete Study</h3>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <p style={styles.text}>
            You are about to permanently delete the following study:
          </p>

          <p style={styles.studyName}>
            {title}
          </p>

          <p style={styles.warning}>
            This action cannot be undone.
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
            Delete Study
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;

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

  studyName: {
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
