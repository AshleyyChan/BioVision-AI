/**
 * constants.js
 * ------------
 * Centralized application constants.
 *
 * Purpose:
 * - Avoid hard-coded strings
 * - Ensure consistency across UI and logic
 * - Make scientific states explicit
 */

/* ================================
   Application Routes
   ================================ */
export const ROUTES = {
  ROOT: "/",
  WELCOME: "/welcome",
  STUDIES: "/studies",
  STUDY: "/study",                 // /study/:studyId
  SPECIMEN: "/study/:studyId/specimen/:specimenId",
};

/* ================================
   Analysis Status States
   ================================ */
export const ANALYSIS_STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
};

/* ================================
   Experimental Phases
   ================================ */
export const EXPERIMENT_PHASES = {
  H2O2: "H2O2",        // Inflammation phase
  UBUFY: "Ubufy",      // Recovery phase
  STRESS: "Stress",    // Magnetic stress / regeneration
};

/* ================================
   UI Messages
   ================================ */
export const UI_MESSAGES = {
  NO_STUDIES: "No studies available. Create a new study to begin.",
  NO_SPECIMENS: "No specimens found for this study.",
  NO_IMAGES: "No images uploaded for this specimen.",
  BASELINE_MISSING:
    "Baseline missing — progression analysis disabled.",
};

/* ================================
   Common UI Placeholder
   ================================ */
export const EMPTY_PLACEHOLDER = "—";

/* ================================
   File Upload
   ================================ */
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
];
