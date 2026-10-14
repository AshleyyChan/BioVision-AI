import React from "react";

/**
 * Aboutus
 * -------
 * Institutional and research overview page.
 *
 * Purpose:
 * - Present research lab identity
 * - List faculty and researchers
 * - Document active research areas
 *
 * This page is informational only.
 */
const Aboutus = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Molecular Biology and Stem Cell Research Laboratory
      </h1>

      <p style={styles.institution}>
        Centre for Molecular and Nanomedical Sciences<br />
        International Research Centre<br />
        Sathyabama Institute of Science and Technology<br />
        Chennai – 600 119
      </p>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Research Faculty</h2>

        <ul style={styles.list}>
          <li>
            <strong>Dr. Chelladurai B. Sakthivel</strong><br />
            Scientist – D
          </li>
          <li>
            <strong>Dr. Kamaran Rajagopalan</strong><br />
            Senior Research Fellow
          </li>
          <li>
            <strong>Dr. Jackson Durairaj Selvam Christyraj</strong><br />
            Scientist – D
          </li>
          <li>
            <strong>Dr. Karthikeyan</strong>
          </li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Research Focus Areas</h2>

        <ul style={styles.list}>
          <li>
            Enhancing wound healing and regeneration potential using
            clitellum-derived factors from earthworm,
            <em> Eudrilus eugeniae</em>.
          </li>

          <li>
            Understanding the stem cell niche and its migration during
            the regeneration process of earthworm,
            <em> Perionyx excavatus</em>.
          </li>

          <li>
            Ex-vivo functional whole-organ models in biological research,
            including organoids, spheroids, cancer models, and cancer
            stem cell studies.
          </li>

          <li>
            Development of an ex-vivo testis model for assessing male
            reproductive toxicity.
          </li>

          <li>
            Exploring the effect of different visible wavelength light
            exposures in enhancing regeneration potential in earthworm,
            <em> Eudrilus eugeniae</em>.
          </li>

          <li>
            Understanding the multifunctional role of TCTP in the
            regeneration process of earthworm,
            <em> Perionyx excavatus</em>.
          </li>
        </ul>
      </section>
    </div>
  );
};

/**
 * Styles — academic, readable, calm
 */
const styles = {
  container: {
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#ffffff",
  },

  institution: {
    fontSize: "15px",
    color: "#cbd5f5",
    lineHeight: 1.7,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#ffffff",
  },

  list: {
    paddingLeft: "20px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#e5e7eb",
  },
};

export default Aboutus;
