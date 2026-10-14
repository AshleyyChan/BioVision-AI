import React from "react";
import { ANALYSIS_STATUS } from "../../utils/constants";

/**
 * AnalysisStatus
 * --------------
 * Calm, research-grade status indicator for analysis.
 * Purely presentational.
 */

const STATUS_MAP = {
  [ANALYSIS_STATUS.IDLE]: {
    text: "Idle",
    bg: "rgba(148,163,184,0.12)",
    color: "#94a3b8",
  },
  [ANALYSIS_STATUS.RUNNING]: {
    text: "Analysis in progress",
    bg: "rgba(251,191,36,0.14)",
    color: "#facc15",
  },
  [ANALYSIS_STATUS.COMPLETED]: {
    text: "Analysis completed",
    bg: "rgba(34,197,94,0.14)",
    color: "#4ade80",
  },
  [ANALYSIS_STATUS.FAILED]: {
    text: "Analysis failed",
    bg: "rgba(239,68,68,0.14)",
    color: "#f87171",
  },
};

const AnalysisStatus = ({ status = ANALYSIS_STATUS.IDLE }) => {
  const { text, color, bg } =
    STATUS_MAP[status] ||
    STATUS_MAP[ANALYSIS_STATUS.IDLE];

  return (
    <div
      style={{
        ...styles.container,
        color,
        backgroundColor: bg,
        borderColor: color,
      }}
      role="status"
      aria-live="polite"
    >
      <span style={styles.dot} />
      {text}
    </div>
  );
};

export default React.memo(AnalysisStatus);

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  container: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",

    padding: "6px 10px",
    borderRadius: "999px",

    fontSize: "12.5px",
    fontWeight: 500,

    border: "1px solid transparent",
    lineHeight: 1,
    userSelect: "none",
  },

  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    opacity: 0.85,
  },
};
