import React from "react";

/**
 * AnalysisResultsTable
 * --------------------
 * Generic, read-only renderer for analysis metrics.
 *
 * Input contract:
 * - results: Array<{ label, value }>
 * - Data is pre-normalized by hooks
 *
 * ❌ No domain logic
 * ❌ No backend awareness
 */
const AnalysisResultsTable = ({ results = [] }) => {
  if (!Array.isArray(results) || results.length === 0) {
    return (
      <div style={styles.placeholder}>
        No analysis metrics available yet.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Metric</th>
            <th style={styles.th}>Value</th>
          </tr>
        </thead>

        <tbody>
          {results.map(({ label, value }) => {
            if (!label) return null;

            const formattedLabel = formatLabel(label);
            const isHighlight = isImportantMetric(label);

            return (
              <tr key={label}>
                <td
                  style={{
                    ...styles.td,
                    ...(isHighlight ? styles.highlightLabel : {}),
                  }}
                >
                  {formattedLabel}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...(isHighlight ? styles.highlightValue : {}),
                  }}
                >
                  {formatValue(value)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(AnalysisResultsTable);

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatLabel = (label) =>
  String(label)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined) return "—";

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value
      : value.toFixed(3);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }

  if (typeof value === "object") {
    return (
      <div style={styles.objectValue}>
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <strong>{formatLabel(k)}:</strong>{" "}
            {formatValue(v)}
          </div>
        ))}
      </div>
    );
  }

  return String(value);
};

/**
 * Emphasize biologically critical metrics
 */
const isImportantMetric = (label) => {
  const key = String(label).toLowerCase();
  return (
    key.includes("inflamm") ||
    key.includes("classification") ||
    key.includes("shape") ||
    key.includes("status")
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = {
  container: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "14px",
    padding: "16px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "10px",
    fontSize: "13px",
    fontWeight: 600,
    borderBottom: "1px solid rgba(255,255,255,0.18)",
    color: "#e5e7eb",
  },

  td: {
    padding: "10px",
    fontSize: "13px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    color: "#ffffff",
    verticalAlign: "top",
  },

  highlightLabel: {
    color: "#fde68a", // amber-300
    fontWeight: 600,
  },

  highlightValue: {
    color: "#facc15", // amber-400
    fontWeight: 600,
  },

  objectValue: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "12.5px",
    color: "rgba(255,255,255,0.85)",
  },

  placeholder: {
    padding: "18px",
    border: "1px dashed rgba(255,255,255,0.25)",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "14px",
  },
};
