import React from "react";
import SpecimenCard from "./SpecimenCard";

/**
 * SpecimenList
 * ------------
 * Displays specimens belonging to a study.
 *
 * Rules:
 * - Presentational only
 * - NO edit/delete UI here
 * - NO navigation logic
 * - Forwards handlers to SpecimenCard
 */
const SpecimenList = ({
  specimens = [],
  onSelect,
  onEdit,
  onDelete,
}) => {
  if (!Array.isArray(specimens) || specimens.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>
          No specimens available. Add a specimen to begin.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {specimens.map((specimen, index) => {
        if (!specimen) return null;

        const id =
          specimen.specimen_id ||
          specimen.id ||
          specimen._id ||
          index; // render-safe fallback

        return (
          <SpecimenCard
            key={id}
            specimen={specimen}
            onClick={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },

  empty: {
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px dashed rgba(255,255,255,0.18)",
  },

  emptyText: {
    fontSize: "15px",
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: "420px",
  },
};

export default React.memo(SpecimenList);
