/**
 * formatters.js
 * -------------
 * Utility formatting helpers used across the application.
 *
 * Purpose:
 * - Keep UI formatting logic consistent
 * - Avoid duplicating small helper functions
 */

/**
 * formatMetricName
 * ----------------
 * Converts snake_case or camelCase metric keys
 * into human-readable labels.
 *
 * Examples:
 * "mean_intensity" → "Mean Intensity"
 * "shapeIrregularity" → "Shape Irregularity"
 */
export const formatMetricName = (key) => {
  if (!key || typeof key !== "string") return "—";

  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → space
    .replace(/_/g, " ")                  // snake_case → space
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

/**
 * formatNumericValue
 * ------------------
 * Formats numeric values for display.
 *
 * - Limits decimal precision
 * - Handles null / undefined / NaN safely
 */
export const formatNumericValue = (value, decimals = 4) => {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number" || Number.isNaN(value)) return "—";

  return value.toFixed(decimals);
};

/**
 * formatPhaseLabel
 * ----------------
 * Formats experimental phase labels consistently.
 */
export const formatPhaseLabel = (phase) => {
  if (!phase || typeof phase !== "string") return "—";
  return phase.toUpperCase();
};
