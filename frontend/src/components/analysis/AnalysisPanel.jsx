import React from "react";
import { ANALYSIS_STATUS } from "../../utils/constants";

/**
 * AnalysisPanel
 * -------------
 * UI-only control panel for triggering and monitoring analysis.
 * No domain logic, no persistence.
 */
const AnalysisPanel = ({
  imageCount = 0,
  status = ANALYSIS_STATUS.IDLE,
  onRunAnalysis,
}) => {
  const canRun = imageCount >= 1;
  const isRunning = status === ANALYSIS_STATUS.RUNNING;
  const hasCompleted = status === ANALYSIS_STATUS.COMPLETED;

  const isDisabled = !canRun || isRunning;

  const handleRun = () => {
    if (isDisabled) return;
    if (typeof onRunAnalysis !== "function") return;
    onRunAnalysis();
  };

  return (
    <div style={styles.panel}>
      {/* Description */}
      <div style={styles.description}>
        This analysis computes <strong>length</strong>,{" "}
        <strong>breadth</strong>, and <strong>area</strong> of the specimen.
        If inflammation is detected, it further classifies it as{" "}
        <strong>bulging</strong>, <strong>elongating</strong>, or{" "}
        <strong>shrinking</strong>.
      </div>

      {/* Eligibility */}
      <div style={styles.eligibility}>
        {canRun ? (
          <span style={styles.valid}>
            ✔ Image detected — analysis ready
          </span>
        ) : (
          <span style={styles.warning}>
            ⚠ Upload an image to enable analysis
          </span>
        )}
      </div>

      {/* Status hints */}
      {isRunning && (
        <div style={styles.runningHint}>
          Analysis in progress. Please wait…
        </div>
      )}

      {hasCompleted && (
        <div style={styles.completedHint}>
          Analysis completed. You may re-run if needed.
        </div>
      )}

      {/* Run button */}
      <button
        type="button"
        onClick={handleRun}
        disabled={isDisabled}
        style={{
          ...styles.button,
          ...(isDisabled ? styles.disabled : {}),
        }}
      >
        {isRunning
          ? "Running Analysis…"
          : hasCompleted
          ? "Re-run Analysis"
          : "Run Analysis"}
      </button>
    </div>
  );
};

export default React.memo(AnalysisPanel);

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "18px",
    borderRadius: "14px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  description: {
    fontSize: "14px",
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.85)",
  },

  eligibility: {
    fontSize: "14px",
  },

  valid: {
    color: "#86efac",
  },

  warning: {
    color: "#fde68a",
  },

  runningHint: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
  },

  completedHint: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.65)",
    fontStyle: "italic",
  },

  button: {
    marginTop: "8px",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#ffffff",
    backgroundColor: "rgba(59,130,246,0.85)",
    border: "1px solid rgba(59,130,246,0.9)",
    transition: "opacity 0.15s ease",
  },

  disabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
};
