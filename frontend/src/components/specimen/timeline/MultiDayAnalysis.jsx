import React, { useMemo } from "react";

import AnalysisStatus from "../../analysis/AnalysisStatus";
import AnalysisResultsTable from "../../analysis/AnalysisResultsTable";

import { ANALYSIS_STATUS } from "../../../utils/constants";

/**
 * MultiDayAnalysis
 * ----------------
 * Displays backend-driven longitudinal analysis
 * across MULTIPLE selected days.
 */
const MultiDayAnalysis = ({
  status = ANALYSIS_STATUS.IDLE,
  results = null,
  error = null,
}) => {
  /* -------------------------------------------------- */
  /* Interpretation & Summary                           */
  /* -------------------------------------------------- */
  const interpretation = results?.interpretation;
  const summary = interpretation?.summary;
  const overallChange = interpretation?.overall_change;

  const metrics = useMemo(() => {
    if (!results || results.status !== "ok") return [];

    const trends = results.trendAnalysis;
    if (!trends || typeof trends !== "object") return [];

    const rows = [];

    // Map backend flat analytical results to readable labels
    const metricMap = {
      avg_area_change: "Rate of Area Growth (mm²/day)",
      avg_length_change: "Rate of Extension (mm/day)",
      avg_breadth_change: "Rate of Dilation (mm/day)",
      intensity_variation: "Metabolic Shift Rate",
      shape_variation: "Boundary Destabilization Rate",
      avg_solidity_change: "Rate of Solidity Change",
    };

    Object.entries(trends).forEach(([key, value]) => {
      if (metricMap[key]) {
        rows.push({ label: metricMap[key], value });
      }
    });

    return rows;
  }, [results]);

  const hasMetrics = metrics.length > 0;
  const hasSeries = Boolean(results?.series);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Multi-Day Analysis</h3>

      {/* Status */}
      <AnalysisStatus status={status} />

      {/* Running */}
      {status === ANALYSIS_STATUS.RUNNING && (
        <div style={styles.placeholder}>
          Longitudinal analysis in progress…
        </div>
      )}

      {/* Completed with results */}
      {status === ANALYSIS_STATUS.COMPLETED && hasMetrics && (
        <div style={styles.resultsWrapper}>
          {interpretation && (
            <div style={{
              ...styles.summaryCard,
              borderColor: interpretation.status_color === 'error' ? '#ef4444' :
                interpretation.status_color === 'warning' ? '#f59e0b' :
                  interpretation.status_color === 'success' ? '#10b981' : 'rgba(255,255,255,0.1)'
            }}>
              <div style={styles.summaryHeader}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={styles.summaryLabel}>Overall Status:</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: interpretation.status_color === 'error' ? 'rgba(239,68,68,0.2)' :
                      interpretation.status_color === 'warning' ? 'rgba(245,158,11,0.2)' :
                        interpretation.status_color === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                    color: interpretation.status_color === 'error' ? '#fca5a5' :
                      interpretation.status_color === 'warning' ? '#fcd34d' :
                        interpretation.status_color === 'success' ? '#6ee7b7' : '#93c5fd',
                  }}>
                    {overallChange}
                  </span>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <span style={styles.summaryLabel}>Stress Level:</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: interpretation.stress_color === 'error' ? 'rgba(239,68,68,0.2)' :
                      interpretation.stress_color === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                    color: interpretation.stress_color === 'error' ? '#fca5a5' :
                      interpretation.stress_color === 'warning' ? '#fcd34d' : '#6ee7b7',
                    border: `1px solid ${interpretation.stress_color === 'error' ? '#ef4444' :
                      interpretation.stress_color === 'warning' ? '#f59e0b' : '#10b981'}`
                  }}>
                    {interpretation.stress_level} Stress
                  </span>
                </div>
              </div>

              <p style={styles.summaryText}>{summary}</p>

              <div style={styles.subTrends}>
                <div style={styles.subTrendItem}>
                  <span style={styles.subTrendLabel}>Physiological Stability:</span>
                  <span style={styles.subTrendValue}>{interpretation.morphology_trend}</span>
                </div>
                <div style={styles.subTrendItem}>
                  <span style={styles.subTrendLabel}>Tissue Health:</span>
                  <span style={styles.subTrendValue}>{interpretation.tissue_health}</span>
                </div>
              </div>
            </div>
          )}

          <AnalysisResultsTable results={metrics} />
        </div>
      )}

      {/* Graph placeholder (future-safe) */}
      {status === ANALYSIS_STATUS.COMPLETED && hasSeries && (
        <div style={styles.graphPlaceholder}>
          Longitudinal feature plots will appear here.
        </div>
      )}

      {/* Idle */}
      {status === ANALYSIS_STATUS.IDLE && (
        <div style={styles.placeholder}>
          Select two or more days to perform longitudinal analysis.
        </div>
      )}

      {/* Failed */}
      {status === ANALYSIS_STATUS.FAILED && (
        <div style={styles.error}>
          {error ||
            "Multi-day analysis failed. Please retry or check backend logs."}
        </div>
      )}
    </div>
  );
};

export default React.memo(MultiDayAnalysis);

/* -------------------------------------------------- */
/* Styles                                             */
/* -------------------------------------------------- */

const styles = {
  container: {
    marginTop: "26px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#ffffff",
  },
  placeholder: {
    padding: "18px",
    border: "1px dashed rgba(255,255,255,0.25)",
    borderRadius: "10px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  error: {
    padding: "16px",
    borderRadius: "10px",
    backgroundColor: "rgba(239,68,68,0.15)",
    color: "#fecaca",
    fontSize: "14px",
  },
  graphPlaceholder: {
    marginTop: "14px",
    padding: "24px",
    border: "1px dashed rgba(255,255,255,0.25)",
    borderRadius: "12px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  resultsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '20px',
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
  },
  summaryText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#e2e8f0',
    margin: '0 0 16px 0',
  },
  subTrends: {
    display: 'flex',
    gap: '24px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  subTrendItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  subTrendLabel: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  subTrendValue: {
    fontSize: '14px',
    color: '#cbd5e1',
    fontWeight: 500,
  }
};
