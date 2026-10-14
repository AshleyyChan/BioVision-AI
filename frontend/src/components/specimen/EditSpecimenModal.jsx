import React, { useEffect, useState } from "react";

import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * EditSpecimenModal
 * -----------------
 * Allows editing an existing specimen.
 *
 * Editable fields:
 * - Specimen name
 * - Description (optional)
 *
 * ❌ No API calls
 * ❌ No navigation
 */
const EditSpecimenModal = ({
  specimen,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /* -------------------------------------------------- */
  /* Sync local state when specimen changes              */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!specimen) return;

    setName(specimen.name || "");
    setDescription(specimen.description || "");
  }, [specimen]);

  if (!specimen) return null;

  /* -------------------------------------------------- */
  /* Save                                                */
  /* -------------------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    onSave?.({
      ...specimen,
      name: name.trim(),
      description: description.trim(),
    });
  };

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */
  return (
    <Modal isOpen onClose={onClose}>
      <div style={styles.container}>
        <h3 style={styles.title}>Edit Specimen</h3>
        <p style={styles.subtitle}>
          Update specimen identity details
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Specimen Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={styles.actions}>
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default React.memo(EditSpecimenModal);

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

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },
};
