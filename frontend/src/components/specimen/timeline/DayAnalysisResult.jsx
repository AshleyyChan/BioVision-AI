import React, { useMemo } from "react";
import AnalysisStatus from "../../analysis/AnalysisStatus";
import AnalysisResultsTable from "../../analysis/AnalysisResultsTable";

import { ANALYSIS_STATUS } from "../../../utils/constants";

/**
 * DayAnalysisResult
 * -----------------
 * Displays backend analysis output for a SINGLE day.
 */
const DayAnalysisResult = ({ status, analysis }) => {
  /* -------------------------------------------------- */
  /* Normalize backend output for display                */
  /* -------------------------------------------------- */
  const results = useMemo(() => {
    if (!analysis || typeof analysis !== "object") return [];

    const rows = [];

    for (const [key, value] of Object.entries(analysis)) {
      if (value === null || value === undefined) continue;

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        rows.push({
          label: prettifyKey(key),
          value,
        });
        continue;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        for (const [subKey, subValue] of Object.entries(value)) {
          if (
            typeof subValue === "number" ||
            typeof subValue === "string"
          ) {
            const label = prettifyKey(`${key}_${subKey}`);
            const unitSuffix = label.includes("Area") ? " mm²" :
              (label.includes("Length") || label.includes("Breadth")) ? " mm" : "";

            rows.push({
              label: label,
              value: typeof subValue === "number" ? `${subValue.toFixed(2)}${unitSuffix}` : subValue,
            });
          }
        }
      } else {
        const label = prettifyKey(key);
        const unitSuffix = label.includes("Area") ? " mm²" :
          (label.includes("Length") || label.includes("Breadth")) ? " mm" : "";

        rows.push({
          label: label,
          value: typeof value === "number" ? `${value.toFixed(2)}${unitSuffix}` : value,
        });
      }
    }

    return rows;
  }, [analysis]);

  const hasResults = results.length > 0;

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */
  return (
    <div style={styles.card}>
      {/* ========== Header ========== */}
      <div style={styles.header}>
        <h3 style={styles.title}>Day Analysis</h3>
        <AnalysisStatus status={status} />
      </div>

      {/* ========== Body ========== */}
      <div style={styles.body}>
        {/* Running */}
        {status === ANALYSIS_STATUS.RUNNING && (
          <StateBox>
            Analysis is currently running…
          </StateBox>
        )}

        {/* Completed with results */}
        {status === ANALYSIS_STATUS.COMPLETED && hasResults && (
          <div style={styles.resultsWrapper}>
            <AnalysisResultsTable results={results} />
          </div>
        )}

        {/* Completed but empty */}
        {status === ANALYSIS_STATUS.COMPLETED && !hasResults && (
          <StateBox>
            Analysis completed, but no measurable
            features were returned.
          </StateBox>
        )}

        {/* Idle */}
        {status === ANALYSIS_STATUS.IDLE && (
          <StateBox>
            No analysis has been run for this
            day yet.
          </StateBox>
        )}

        {/* Failed */}
        {status === ANALYSIS_STATUS.FAILED && (
          <div style={styles.errorBox}>
            Analysis failed. Please retry or
            check backend logs.
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(DayAnalysisResult);

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const prettifyKey = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const StateBox = ({ children }) => (
  <div style={styles.stateBox}>{children}</div>
);

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  card: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },

  title: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: "0.2px",
  },

  body: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  resultsWrapper: {
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  stateBox: {
    padding: "18px",
    borderRadius: "12px",
    border: "1px dashed rgba(255,255,255,0.25)",
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.5,
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  errorBox: {
    padding: "16px",
    borderRadius: "12px",
    backgroundColor: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.45)",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: 1.5,
  },
};
