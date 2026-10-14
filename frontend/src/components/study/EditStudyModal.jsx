import React, { useState, useEffect } from "react";

import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * EditStudyModal
 * --------------
 * Allows editing an existing study.
 *
 * Editable fields:
 * - Study name
 * - Researcher name
 * - Date
 * - Time
 */
const EditStudyModal = ({ study, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState("");
  const [researcherName, setResearcherName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  /* -------------------------------------------------- */
  /* Sync local state when study changes                */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!study) return;

    setTitle(study.title || "");
    setResearcherName(study.researcherName || "");
    setDate(study.date || "");
    setTime(study.time || "");
  }, [study]);

  if (!study) return null;

  /* -------------------------------------------------- */
  /* Save                                                */
  /* -------------------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !researcherName.trim() || !date || !time) {
      return;
    }

    onSave({
      ...study,
      title: title.trim(),
      researcherName: researcherName.trim(),
      date,
      time,
    });
  };

  /* -------------------------------------------------- */
  /* Delete                                              */
  /* -------------------------------------------------- */
  const handleDelete = () => {
    onDelete?.(study.study_id);
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div style={styles.container}>
        <h3 style={styles.title}>Edit Study</h3>
        <p style={styles.subtitle}>Update study details</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Study Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Researcher Name"
            value={researcherName}
            onChange={(e) => setResearcherName(e.target.value)}
            required
          />

          <div style={styles.row}>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div style={styles.actions}>
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>

        {/* Destructive action */}
        <div style={styles.deleteRow}>
          <Button
            variant="danger"
            type="button"
            onClick={handleDelete}
          >
            Delete Study
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditStudyModal;

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = {
  container: {
    width: "500px",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "8px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },
  deleteRow: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "flex-end",
  },
};
