import React, { useState, useEffect } from "react";

import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

const CreateSpecimenModal = ({ onCreate, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /* -------------------------------------------------- */
  /* Reset error on mount                               */
  /* -------------------------------------------------- */

  useEffect(() => {
    setError(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onCreate || submitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setSubmitting(true);
      setError(null);

      await onCreate({
        name: trimmedName,
        description: description.trim(),
      });

      onClose?.(); // close ONLY after success
    } catch (err) {
      console.error("Failed to create specimen:", err);
      setError("Failed to create specimen. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={submitting ? undefined : onClose}
      disableBackdropClick={submitting}
      disableEscClose={submitting}
    >
      <div style={styles.container}>
        <h3 style={styles.title}>Create New Specimen</h3>

        <form style={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Specimen Name"
            placeholder="Earthworm A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />

          <Input
            label="Description (optional)"
            placeholder="Control group specimen"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!name.trim() || submitting}
            >
              {submitting ? "Creating..." : "Create Specimen"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    width: "420px",
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#ffffff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "13px",
  },
};

export default CreateSpecimenModal;
