import React from "react";

/**
 * Formulas
 * --------
 * Reference page for formulas, metrics, and indices
 * used in earthworm biological image analysis.
 *
 * Audience:
 * - Researchers
 * - Postgraduate students
 * - Undergraduate learners
 */
const Formulas = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Formulas & Scientific Metrics</h1>

      {/* Morphological metrics */}
      <section style={styles.section}>
        <h2 style={styles.heading}>Extracted Morphological Features</h2>
        <ul style={styles.list}>
          <li>
            <strong>Area (Aₜ)</strong> – Total segmented gland area at time t
          </li>
          <li>
            <strong>Mean Intensity (Iₜ)</strong> – Average pixel intensity
            indicating inflammation level
          </li>
          <li>
            <strong>Shape Irregularity (Sₜ)</strong> – Structural distortion
            of gland geometry
          </li>
          <li>
            <strong>Texture Entropy (Tₜ)</strong> – Tissue heterogeneity and
            disruption
          </li>
        </ul>
      </section>

      {/* Inflammation */}
      <section style={styles.section}>
        <h2 style={styles.heading}>Inflammation Score (H₂O₂ Phase)</h2>

        <pre style={styles.formula}>
ΔA = (Aₜ − A₀) / A₀  
ΔI = (Iₜ − I₀) / I₀  
ΔS = (Sₜ − S₀) / S₀  
ΔT = (Tₜ − T₀) / T₀
        </pre>

        <pre style={styles.formula}>
Inflammation Score =
0.35ΔA + 0.30ΔI + 0.20ΔS + 0.15ΔT
        </pre>

        <ul style={styles.list}>
          <li>0.00 – 0.30 → Mild</li>
          <li>0.31 – 0.60 → Moderate</li>
          <li>0.61 – 1.00 → Severe</li>
        </ul>
      </section>

      {/* Recovery */}
      <section style={styles.section}>
        <h2 style={styles.heading}>Recovery Score (Ubufy Phase)</h2>

        <pre style={styles.formula}>
Rₓ = 1 − |Xₜ − X₀| / X₀
        </pre>

        <pre style={styles.formula}>
Recovery Index =
0.30Rₐ + 0.30Rᵢ + 0.20Rₛ + 0.20Rₜ
        </pre>

        <ul style={styles.list}>
          <li>≤ 0.40 → Inflamed</li>
          <li>≤ 0.60 → Recovering</li>
          <li>≤ 0.80 → Partially Healed</li>
          <li>&gt; 0.80 → Healed</li>
        </ul>
      </section>
    </div>
  );
};

/* Styles */
const styles = {
  container: {
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
    gap: "36px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#ffffff",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#ffffff",
  },
  list: {
    paddingLeft: "20px",
    fontSize: "15px",
    color: "#e5e7eb",
    lineHeight: 1.7,
  },
  formula: {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "14px",
    color: "#f8fafc",
    overflowX: "auto",
  },
};

export default Formulas;
