import React from "react";
import Modal from "react-modal";
import Button from "../common/Button"; // Adjust the path if needed

/**
 * ConfirmDeleteDayModal
 * ----------------------
 * A modal to confirm the deletion of a day.
 */
const ConfirmDeleteDayModal = ({ isOpen, onClose, onConfirm, dayLabel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Confirm Deletion"
      style={customStyles}
    >
      <div style={styles.modalContent}>
        <h2 style={styles.title}>Confirm Deletion</h2>
        <p style={styles.message}>
          Are you sure you want to delete the day: <strong>{dayLabel}</strong>?
        </p>
        <div style={styles.buttonContainer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background
  },
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#2a2a2a",
    padding: "30px",
    borderRadius: "10px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    color: "#fff",
  },
};

const styles = {
  modalContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  message: {
    fontSize: "16px",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
  },
};

export default ConfirmDeleteDayModal;
