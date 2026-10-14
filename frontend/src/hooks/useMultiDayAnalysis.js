import { useState, useCallback } from "react";
import { ANALYSIS_STATUS } from "../utils/constants";
import analyzeApi from "../api/analyze.api";

/**
 * useMultiDayAnalysis
 * ------------------
 * Specimen-scoped longitudinal analysis hook.
 *
 * Expects FULL day objects with completed analysis.
 */
const useMultiDayAnalysis = () => {
  const [status, setStatus] = useState(ANALYSIS_STATUS.IDLE);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runMultiDayAnalysis = useCallback(async (days = []) => {
    if (!Array.isArray(days) || days.length < 2) {
      setError("Select at least two analyzed days.");
      return null;
    }

    // Keep only days with completed analysis
    const analyzedDays = days.filter(
      (d) => d?.analysis && typeof d.analysis === "object"
    );

    if (analyzedDays.length < 2) {
      setError("At least two days must have completed analysis.");
      return null;
    }

    // Preserve temporal order (DO NOT FABRICATE)
    const dayResults = analyzedDays.map((day) => {
      // Extract numerical day from label (e.g., "Day 14" -> 14)
      const labelMatch = day.label?.match(/Day\s*(\d+)/i);
      const dayNumber = labelMatch ? parseFloat(labelMatch[1]) : 0;

      return {
        day: day.day_id,
        day_number: dayNumber,
        area: day.analysis.area,
        length: day.analysis.length,
        breadth: day.analysis.breadth,
        solidity: day.analysis.solidity,
        mean_intensity: day.analysis.mean_intensity,
        shape_irregularity: day.analysis.shape_irregularity,
      };
    });

    try {
      setStatus(ANALYSIS_STATUS.RUNNING);
      setError(null);
      setResults(null);

      const response =
        await analyzeApi.runMultiDayAnalysis(dayResults);

      const data = response?.data?.results ?? null;

      if (!data) {
        throw new Error("Empty multi-day analysis response");
      }

      setResults(data);
      setStatus(ANALYSIS_STATUS.COMPLETED);
      return data;
    } catch (err) {
      console.error("Multi-day analysis failed", err);
      setStatus(ANALYSIS_STATUS.FAILED);
      setError("Multi-day analysis failed.");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(ANALYSIS_STATUS.IDLE);
    setResults(null);
    setError(null);
  }, []);

  return {
    runMultiDayAnalysis,
    status,
    results,
    error,
    reset,
  };
};

export default useMultiDayAnalysis;
