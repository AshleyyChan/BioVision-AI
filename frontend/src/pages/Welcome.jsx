import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

/**
 * Welcome (Landing Dashboard)
 * ---------------------------
 * Institutional landing page.
 *
 * - Research-first
 * - Calm, confident, academic
 * - Strong central call to action
 */
const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* ---------------- HERO ---------------- */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          AI-Powered Biological Image Analysis
        </h1>

        <p style={styles.subtitle}>
          A research-grade software platform for quantitative analysis of
          earthworm prostate gland experiments used in molecular biology
          and stem cell research.
        </p>

        {/* ---- PRIMARY CTA ---- */}
        <div style={styles.ctaWrapper}>
          <Button
            onClick={() => navigate("/studies")}
            styleOverride={styles.ctaButton}
          >
            Get Started
          </Button>
          <p style={styles.ctaHint}>
            Begin a new research study
          </p>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section style={styles.features}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>For Researchers</h3>
          <p style={styles.cardText}>
            Organize studies, manage specimens, and perform
            explainable, formula-driven analysis on microscopy images.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>For Students</h3>
          <p style={styles.cardText}>
            Learn experimental workflows, quantitative biological
            metrics, and scientific interpretation using real data.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Scientific Rigor</h3>
          <p style={styles.cardText}>
            Designed for reproducibility, longitudinal analysis,
            and future AI-assisted research extensions.
          </p>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} Molecular Biology & Stem Cell Research Lab ·
        Sathyabama Institute of Science and Technology
      </footer>
    </div>
  );
};

export default Welcome;

/**
 * Styles — colourful but institutional
 */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "88px 28px 48px",
    display: "flex",
    flexDirection: "column",
    gap: "96px",
    background:
      "radial-gradient(1200px 600px at 50% -200px, #1e293b 0%, #020617 60%)",
    color: "#e5e7eb",
  },

  /* ---------- HERO ---------- */

  hero: {
    maxWidth: "960px",
    margin: "0 auto",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "28px",
  },

  title: {
    fontSize: "56px",
    fontWeight: 700,
    letterSpacing: "-0.8px",
    color: "#f8fafc",
    lineHeight: 1.15,
    maxWidth: "900px",
  },

  subtitle: {
    fontSize: "20px",
    lineHeight: 1.75,
    color: "#cbd5f5",
    maxWidth: "760px",
  },

  /* ---------- CTA ---------- */

  ctaWrapper: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  ctaButton: {
    padding: "16px 36px",
    fontSize: "18px",
    borderRadius: "10px",
  },

  ctaHint: {
    fontSize: "13px",
    color: "#94a3b8",
    letterSpacing: "0.3px",
  },

  /* ---------- FEATURES ---------- */

  features: {
    maxWidth: "1120px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "32px",
  },

  card: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow:
      "0 14px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#ffffff",
  },

  cardText: {
    fontSize: "14px",
    lineHeight: 1.75,
    color: "#cbd5f5",
  },

  /* ---------- FOOTER ---------- */

  footer: {
    marginTop: "auto",
    textAlign: "center",
    fontSize: "14px",
    color: "#94a3b8",
    paddingTop: "28px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
};
