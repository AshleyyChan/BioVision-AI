import React from "react";
import Button from "../common/Button";

/**
 * StudyCard
 * ---------
 * Displays a concise summary of a study.
 *
 * Fields used:
 * - title
 * - researcherName
 * - date
 * - time
 */
const StudyCard = ({ study, onOpen, onEdit }) => {
  if (!study) return null;

  const handleOpen = () => {
    onOpen?.(study); // ✅ always pass study
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      style={styles.card}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      aria-label={`Open study ${study.title || "Untitled study"}`}
    >
      {/* Header row */}
      <div style={styles.header}>
        <h4 style={styles.title}>
          {study.title || "Untitled Study"}
        </h4>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // 🚫 prevent card click
            onEdit?.(study);
          }}
        >
          Edit
        </Button>
      </div>

      {/* Researcher */}
      <p style={styles.researcher}>
        Researcher: {study.researcherName || "—"}
      </p>

      {/* Meta row */}
      <div style={styles.meta}>
        <span>{study.date || "—"}</span>
        <span>{study.time || "—"}</span>
      </div>
    </div>
  );
};

export default React.memo(StudyCard);

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = {
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "14px",
    padding: "20px 22px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "border-color 0.15s ease",
    outline: "none",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  title: {
    fontSize: "17px",
    fontWeight: 600,
    color: "#ffffff",
  },

  researcher: {
    fontSize: "13px",
    color: "#cbd5f5",
  },

  meta: {
    marginTop: "6px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#94a3b8",
  },
};
