import React from "react";
import StudyCard from "./StudyCard";

/**
 * StudyList
 * ---------
 * Displays a grid of studies.
 *
 * Responsibilities:
 * - Render StudyCard components
 * - Handle empty state
 * - Delegate selection & edit to parent
 *
 * Presentational only.
 */
const StudyList = ({ studies = [], onSelect, onEdit }) => {
  if (!Array.isArray(studies) || studies.length === 0) {
    return (
      <div
        style={styles.emptyContainer}
        role="status"
        aria-live="polite"
      >
        <p style={styles.emptyText}>
          No studies found. Create a new study to begin.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {studies.map((study) => (
        <StudyCard
          key={study.study_id}      // ✅ canonical key
          study={study}
          onOpen={onSelect}         // ✅ FIX: pass handler directly
          onEdit={onEdit}           // ✅ FIX: pass handler directly
        />
      ))}
    </div>
  );
};

export default React.memo(StudyList);

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "22px",
  },

  emptyContainer: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px dashed rgba(255,255,255,0.18)",
  },

  emptyText: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#ffffff",
    textAlign: "center",
    maxWidth: "420px",
  },
};
