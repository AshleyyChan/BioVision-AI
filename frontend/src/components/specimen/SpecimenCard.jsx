import React from "react";
import Button from "../common/Button";

/**
 * SpecimenCard
 * ------------
 * Presentational card for a single Specimen.
 *
 * Displays ONLY identity-level information.
 * No days. No treatment. No analysis.
 *
 * ✅ Card click → open specimen
 * ✅ Edit/Delete buttons inside card
 */
const SpecimenCard = ({
  specimen,
  onClick,
  onEdit,
  onDelete,
}) => {
  if (!specimen) return null;

  const id =
    specimen.specimen_id ||
    specimen.id ||
    specimen._id ||
    "";

  const createdAt = specimen.created_at
    ? new Date(specimen.created_at)
    : null;

  const handleCardClick = () => {
    onClick?.(specimen);
  };

  return (
    <div
      style={styles.card}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick();
        }
      }}
    >
      {/* ---------- Header ---------- */}
      <h4 style={styles.title}>
        {specimen.name || "Unnamed Specimen"}
      </h4>

      {/* ---------- Meta ---------- */}
      <div style={styles.meta}>
        <span>ID: {id ? id.slice(0, 8) : "—"}</span>
        <span>
          Created:{" "}
          {createdAt && !isNaN(createdAt)
            ? createdAt.toLocaleDateString()
            : "—"}
        </span>
      </div>

      {specimen.description && (
        <p style={styles.description}>
          {specimen.description}
        </p>
      )}

      {/* ---------- Actions ---------- */}
      <div
        style={styles.actions}
        onClick={(e) => e.stopPropagation()} // 🚫 prevent navigation
      >
        <Button
          variant="secondary"
          size="small"
          onClick={() => onEdit?.(specimen)}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          size="small"
          onClick={() => onDelete?.(specimen)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  card: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },

  title: {
    fontSize: "15px",
    fontWeight: 600,
    color: "var(--text-primary)",
  },

  meta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "var(--text-muted)",
  },

  description: {
    fontSize: "13px",
    color: "var(--text-muted)",
    lineHeight: 1.4,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "6px",
  },
};

export default React.memo(SpecimenCard);
