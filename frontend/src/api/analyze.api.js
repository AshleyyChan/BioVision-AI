/**
 * analyze.api.js
 * --------------
 * Backend contract for analysis execution.
 *
 * Scope:
 * - Single-day analysis
 * - Multi-day (longitudinal) analysis
 *
 * ❌ No routing logic
 * ❌ No data shaping beyond payload
 */

import apiClient from "./apiClient";

/**
 * Analysis API
 */
const analyzeApi = {
  /**
   * Run analysis for a single day
   * POST /api/analyze/day
   *
   * body:
   * {
   *   imagePath: string
   * }
   */
  runDayAnalysis(imagePath) {
    if (!imagePath) {
      throw new Error("imagePath is required");
    }

    console.log("analyze.api.js: runDayAnalysis payload:", { imagePath });
    return apiClient.post("/analyze/day", {
      imagePath,
    });
  },

  /**
   * Run longitudinal analysis for multiple days
   * POST /api/analyze/multi-day
   *
   * body:
   * {
   *   dayResults: Array
   * }
   */
  runMultiDayAnalysis(dayResults) {
    if (!Array.isArray(dayResults) || dayResults.length < 2) {
      throw new Error(
        "dayResults must be an array with at least two entries"
      );
    }

    return apiClient.post("/analyze/multi-day", {
      days: dayResults,
    });
  },
};

export default analyzeApi;
