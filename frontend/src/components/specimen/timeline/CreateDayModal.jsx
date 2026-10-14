import React, { useState } from "react";
import Modal from "../../common/Modal";
import Input from "../../common/Input";
import Button from "../../common/Button";

/**
 * CreateDayModal
 * --------------
 * Creates a logical Day container ONLY.
 *
 * ✅ Day label
 * ❌ No experiment metadata
 * ❌ No image
 * ❌ No analysis
 */
const CreateDayModal = ({ onCreate, onClose }) => {
  const [label, setLabel] = useState("");

  /* -------------------------------------------------- */
  /* Submit                                             */
  /* -------------------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = label.trim();
    if (!trimmed || !onCreate) return;

    onCreate({
      label: trimmed,
    });

    onClose?.();
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div style={styles.container}>
        <h3 style={styles.title}>Add Day</h3>
        <p style={styles.subtitle}>
          Create a new experimental timepoint
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            label="Day Label"
            placeholder="Day 1 / Hour 12 / T+24h"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
            required
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
              disabled={!label.trim()}
            >
              Create Day
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default React.memo(CreateDayModal);

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

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
    marginBottom: "6px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "4px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
};
