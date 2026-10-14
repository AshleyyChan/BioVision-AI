import React, { useState, useEffect } from "react";

import uploadApi from "../api/imageCompareUpload.api";
import compareApi from "../api/compare.api";
import Loader from "../components/common/Loader";

/**
 * ImageCompare
 * ------------
 * Side-by-side comparison of two prostate gland images.
 *
 * Fully wired, research-grade analysis.
 */
const ImageCompare = () => {
  const [imageA, setImageA] = useState(null);
  const [imageB, setImageB] = useState(null);
  const [previewA, setPreviewA] = useState(null);
  const [previewB, setPreviewB] = useState(null);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (previewA) URL.revokeObjectURL(previewA);
      if (previewB) URL.revokeObjectURL(previewB);
    };
  }, [previewA, previewB]);

  const handleImageSelect = (e, setImage, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResults(null);
    setError(null);

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const runComparison = async () => {
    if (!imageA || !imageB || loading) return;

    try {
      setLoading(true);
      setResults(null);
      setError(null);

      const { imageAPath, imageBPath } =
        await uploadApi.uploadCompareImages(imageA, imageB);

      const comparisonResult =
        await compareApi.runImageComparison(imageAPath, imageBPath);

      setResults(comparisonResult);
    } catch (err) {
      setError(
        err?.message ||
        "Image comparison failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Image Comparison</h1>
        <p style={styles.subtitle}>
          Upload two prostate gland images to quantitatively compare
          morphological and intensity-based changes.
        </p>
      </header>

      {/* Uploads */}
      <div style={styles.uploadGrid}>
        <UploadBox
          label="Image A"
          preview={previewA}
          onSelect={(e) =>
            handleImageSelect(e, setImageA, setPreviewA)
          }
        />
        <UploadBox
          label="Image B"
          preview={previewB}
          onSelect={(e) =>
            handleImageSelect(e, setImageB, setPreviewB)
          }
        />
      </div>

      {/* Action */}
      <div style={styles.actionRow}>
        <button
          style={{
            ...styles.compareBtn,
            ...(loading || !imageA || !imageB
              ? styles.compareBtnDisabled
              : {}),
          }}
          onClick={runComparison}
          disabled={loading || !imageA || !imageB}
        >
          {loading ? "Running Analysis…" : "Run Comparison"}
        </button>
      </div>

      {loading && <Loader />}
      {error && <p style={styles.error}>{error}</p>}

      {results && (
        <section style={styles.results}>
          <h2 style={styles.resultsTitle}>
            Quantitative Results
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            <div style={styles.resultsMainGrid}>
              {/* 1️⃣ Image A Container */}
              {results.image_a_metrics && (
                <div style={{ ...styles.metricCard, ...styles.metricCardA }}>
                  <h3 style={styles.cardTitle}>Image A Analysis</h3>
                  <div style={styles.metricGrid}>
                    <MetricItem label="Length" value={results.image_a_metrics.length?.toFixed(2)} unit="mm" />
                    <MetricItem label="Breadth" value={results.image_a_metrics.breadth?.toFixed(2)} unit="mm" />
                    <MetricItem label="Area" value={results.image_a_metrics.area?.toFixed(2)} unit="mm²" />
                    <MetricItem label="Mean Intensity" value={results.image_a_metrics.mean_intensity?.toFixed(2)} />
                    <MetricItem label="Shape Irregularity" value={results.image_a_metrics.shape_irregularity?.toFixed(3)} />
                    <MetricItem label="Solidity" value={results.image_a_metrics.solidity?.toFixed(3)} />
                  </div>
                </div>
              )}

              {/* 2️⃣ Image B Container */}
              {results.image_b_metrics && (
                <div style={{ ...styles.metricCard, ...styles.metricCardB }}>
                  <h3 style={styles.cardTitle}>Image B Analysis</h3>
                  <div style={styles.metricGrid}>
                    <MetricItem label="Length" value={results.image_b_metrics.length?.toFixed(2)} unit="mm" />
                    <MetricItem label="Breadth" value={results.image_b_metrics.breadth?.toFixed(2)} unit="mm" />
                    <MetricItem label="Area" value={results.image_b_metrics.area?.toFixed(2)} unit="mm²" />
                    <MetricItem label="Mean Intensity" value={results.image_b_metrics.mean_intensity?.toFixed(2)} />
                    <MetricItem label="Shape Irregularity" value={results.image_b_metrics.shape_irregularity?.toFixed(3)} />
                    <MetricItem label="Solidity" value={results.image_b_metrics.solidity?.toFixed(3)} />
                  </div>
                </div>
              )}
            </div>

            {/* 3️⃣ Overall Comparison Results */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Overall Comparison</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <table style={styles.summaryTable}>
                  <tbody>
                    <SummaryRow label="Area Change" value={results.area_change_percent} unit="%" />
                    <SummaryRow label="Length Change" value={results.length_change_percent} unit="%" />
                    <SummaryRow label="Width Change" value={results.width_change_percent} unit="%" />
                    <SummaryRow label="Intensity Shift" value={results.intensity_change_percent} unit="%" />
                    <SummaryRow label="Color Score" value={results.color_change_score} unit="" />
                  </tbody>
                </table>

                <div style={styles.statusSection}>
                  <div style={styles.statusBox}>
                    <span style={styles.statusLabel}>Biological Status</span>
                    <span style={{
                      ...styles.statusValue,
                      color: results.overall_status === "Under Stress" ? "#f87171" :
                        results.overall_status === "Adapting response" ? "#f59e0b" : "#4ade80"
                    }}>
                      {results.overall_status}
                    </span>
                  </div>

                  <div style={styles.statusBox}>
                    <span style={styles.statusLabel}>Morphology Shift</span>
                    <span style={styles.morphologyValue}>
                      {results.morphology_change}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}
    </div>
  );
};

export default ImageCompare;

/* ---------------- Upload Box ---------------- */

const UploadBox = ({ label, preview, onSelect }) => (
  <div style={styles.uploadBox}>
    <div style={styles.boxHeader}>{label}</div>

    {preview ? (
      <img
        src={preview}
        alt={`${label} preview`}
        style={styles.preview}
      />
    ) : (
      <div style={styles.placeholder}>
        No image selected
      </div>
    )}

    <label style={styles.uploadBtn}>
      Select Image
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={onSelect}
      />
    </label>
  </div>
);

/* -------------------------------------------------- */
/* Styles (UNCHANGED)                                 */
/* -------------------------------------------------- */

// Enhanced components for "Awesome" look
const MetricItem = ({ label, value, unit = "" }) => (
  <div style={styles.metricItem}>
    <span style={styles.metricLabel}>{label}</span>
    <span style={styles.metricValue}>
      {value} {unit}
    </span>
  </div>
);

const SummaryRow = ({ label, value, unit }) => {
  const isNegative = value < 0;
  const isPositive = value > 0;
  // Neon colors for impact
  const valueColor = isNegative ? "#60a5fa" : isPositive ? "#f87171" : "#e2e8f0";
  const bg = isNegative ? "rgba(96, 165, 250, 0.1)" : isPositive ? "rgba(248, 113, 113, 0.1)" : "transparent";

  return (
    <tr style={styles.summaryRow}>
      <td style={styles.summaryCellLabel}>{label}</td>
      <td style={{ ...styles.summaryCellValue }}>
        <span style={{
          color: valueColor,
          background: bg,
          padding: "4px 12px",
          borderRadius: "6px",
          border: `1px solid ${valueColor}30`
        }}>
          {value > 0 ? "+" : ""}{typeof value === 'number' ? value.toFixed(2) : value}{unit}
        </span>
      </td>
    </tr>
  );
};

const styles = {
  container: {
    maxWidth: "1280px", // Wider for side-by-side
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "42px",
    padding: "0 20px",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
    textAlign: "center",
  },

  title: {
    fontSize: "48px",
    fontWeight: 800,
    background: "linear-gradient(to right, #818cf8, #c084fc, #f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
    letterSpacing: "-0.02em",
  },

  subtitle: {
    fontSize: "16px",
    maxWidth: "600px",
    color: "#94a3b8",
    lineHeight: 1.6,
  },

  uploadGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "36px",
    marginTop: "20px",
  },

  uploadBox: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minHeight: "400px",
    transition: "all 0.3s ease",
    ":hover": {
      borderColor: "rgba(99, 102, 241, 0.5)",
      background: "rgba(15, 23, 42, 0.8)",
    }
  },

  boxHeader: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#e2e8f0",
    textAlign: "center",
  },

  placeholder: {
    flex: 1,
    border: "2px solid rgba(255,255,255,0.05)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "15px",
    background: "rgba(0,0,0,0.2)",
  },

  preview: {
    width: "100%",
    height: "260px",
    objectFit: "contain",
    borderRadius: "16px",
    backgroundColor: "#000",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  uploadBtn: {
    alignSelf: "center",
    padding: "12px 32px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#ffffff",
    transition: "all 0.2s",
  },

  actionRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },

  compareBtn: {
    padding: "18px 56px",
    fontSize: "18px",
    fontWeight: 600,
    borderRadius: "100px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#ffffff",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5)",
    transition: "transform 0.2s",
  },

  compareBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  results: {
    marginTop: "40px",
    background: "transparent",
    padding: "0",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  resultsTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: "20px",
  },

  error: {
    fontSize: "15px",
    color: "#f87171",
    textAlign: "center",
    background: "rgba(248, 113, 113, 0.1)",
    padding: "12px",
    borderRadius: "8px",
  },

  /* --- AWESOME STYLES --- */

  // Grid for Side-by-Side Cards
  resultsMainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
  },

  metricCard: {
    background: "rgba(15, 23, 42, 0.6)",
    padding: "32px",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    position: "relative",
    overflow: "hidden",
  },

  // Neon top borders
  metricCardA: {
    borderTop: "4px solid #818cf8",
    background: "linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)",
  },
  metricCardB: {
    borderTop: "4px solid #f472b6",
    background: "linear-gradient(180deg, rgba(244, 114, 182, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "24px",
    fontSize: "20px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metricGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  // Highlight Section for Big Stats
  heroStat: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  secondaryStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px 12px",
  },

  metricItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  metricLabel: {
    fontSize: "15px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
    fontWeight: 600,
  },

  metricValue: {
    fontWeight: 700,
    color: "#f8fafc",
    fontVariantNumeric: "tabular-nums",
  },

  // Summary at bottom
  summaryCard: {
    background: "#0f172a", // Solid dark background
    padding: "40px",
    borderRadius: "32px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    position: "relative",
  },

  summaryTitle: {
    marginTop: 0,
    marginBottom: "32px",
    fontSize: "20px",
    fontWeight: 800,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  summaryTable: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 16px",
    maxWidth: "800px",
    margin: "0 auto",
  },

  summaryRow: {
    background: "rgba(255, 255, 255, 0.02)",
    cursor: "default",
  },

  summaryCellLabel: {
    padding: "16px 24px",
    color: "#cbd5e1",
    fontSize: "16px",
    fontWeight: 500,
    borderTopLeftRadius: "12px",
    borderBottomLeftRadius: "12px",
  },

  summaryCellValue: {
    padding: "16px 24px",
    textAlign: "right",
    fontSize: "15px",
    fontWeight: 700,
    borderTopRightRadius: "12px",
    borderBottomRightRadius: "12px",
  },

  statusSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  statusBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  statusLabel: {
    fontSize: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#64748b",
    fontWeight: 600,
  },
  statusValue: {
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  morphologyValue: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#e2e8f0",
    letterSpacing: "-0.01em",
  },
};
