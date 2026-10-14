import React, { useState } from "react";

import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * CreateStudyModal
 * ----------------
 * Modal for creating a new study.
 *
 * Required inputs:
 * - Study name
 * - Researcher name
 * - Date
 * - Time
 */
const CreateStudyModal = ({ onCreate, onClose }) => {
  const [studyName, setStudyName] = useState("");
  const [researcherName, setResearcherName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const title = studyName.trim();
    const researcher = researcherName.trim();

    if (!title || !researcher || !date || !time) {
      return;
    }

    try {
      setSubmitting(true);
      await onCreate?.({
        title,
        researcherName: researcher,
        date,
        time,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div style={styles.container}>
        <h3 style={styles.title}>Create New Study</h3>
        <p style={styles.subtitle}>
          Enter basic experiment details
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Study Name"
            placeholder="Enter study name"
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Researcher Name"
            placeholder="Enter researcher name"
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
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating…" : "Create Study"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateStudyModal;

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
};
