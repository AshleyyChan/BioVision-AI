import React, { useState } from "react";
import CreateDayModal from "./CreateDayModal";
import Button from "../../common/Button"; // Adjust the path if needed

/**
 * DaySidebar
 * ----------
 * Full-height, resizable sidebar that stretches
 * from top to bottom of the viewport and resizes
 * the entire layout partition.
 */
const DaySidebar = ({
  days = [],
  activeDayId,
  selectedDays = [],
  onDaySelect,
  onToggleSelect,
  onAnalyseSelected,
  onCreateDay,
  onDeleteDay,          // ✅ NEW
}) => {
  const [showCreateDay, setShowCreateDay] = useState(false);

  const handleDeleteDay = (e, day) => {
    e.stopPropagation();  // Prevent triggering the onDaySelect event
    onDeleteDay?.(day);   // Call the onDeleteDay function passed from the parent
  };

  return (
    <aside style={styles.sidebar}>
      {/* ===== Header ===== */}
      <div style={styles.header}>
        <h3 style={styles.title}>Experiment Days</h3>
        <Button size="small" onClick={() => setShowCreateDay(true)}>
          + Add Day
        </Button>
      </div>

      {/* ===== Day List ===== */}
      <div style={styles.list}>
        {days.length === 0 ? (
          <div style={styles.empty}>No days added yet</div>
        ) : (
          days.map((day, index) => {
            if (!day?.day_id) return null;

            const isActive = day.day_id === activeDayId;
            const isSelected = selectedDays.includes(day.day_id);
            const label = day.label?.trim() || `Day ${index + 1}`;

            return (
              <div
                key={day.day_id}
                style={{
                  ...styles.dayItem,
                  ...(isActive ? styles.activeDay : {}),
                }}
                onClick={() => onDaySelect?.(day.day_id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect?.(day.day_id)}
                  onClick={(e) => e.stopPropagation()}
                />

                <span style={styles.dayLabel}>{label}</span>

                {/* ❌ Delete Day */}
                <button
                  title="Delete day"
                  onClick={(e) => handleDeleteDay(e, day)} // Handle the delete button click
                  style={styles.deleteBtn}
                >
                  −
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ===== Footer ===== */}
      <div style={styles.footer}>
        <Button
          fullWidth
          onClick={() => onAnalyseSelected?.()}
          disabled={selectedDays.length < 2}
          variant={
            selectedDays.length < 2 ? "secondary" : "primary"
          }
        >
          Analyse Selected Days
        </Button>
      </div>

      {/* ===== Create Day Modal ===== */}
      {showCreateDay && (
        <CreateDayModal
          onCreate={async (dayData) => {
            await onCreateDay?.(dayData);
            setShowCreateDay(false);
          }}
          onClose={() => setShowCreateDay(false)}
        />
      )}
    </aside>
  );
};

export default React.memo(DaySidebar);

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  sidebar: {
    height: "100vh",          // 🔑 FULL WINDOW HEIGHT
    width: "320px",
    minWidth: "260px",
    maxWidth: "420px",

    display: "flex",
    flexDirection: "column",
    flexShrink: 0,

    borderRight: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",

    /* 🔑 REAL PARTITION RESIZE */
    resize: "horizontal",
    overflow: "auto",         // required for resize to work properly
  },

  header: {
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    flexShrink: 0,
  },

  title: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#ffffff",
  },

  list: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  dayItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",

    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",

    backgroundColor: "rgba(255,255,255,0.04)",

    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",

    transition:
      "background-color 0.15s ease, border-color 0.15s ease",
  },

  activeDay: {
    backgroundColor: "rgba(59,130,246,0.22)",
    borderColor: "rgba(59,130,246,0.4)",
  },

  dayLabel: {
    flex: 1,
    fontSize: "14px",
    color: "#e5e7eb",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#f87171", // soft red
    fontSize: "18px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },

  empty: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#94a3b8",
  },

  footer: {
    padding: "14px 16px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.25)",
    flexShrink: 0,
  },
};
