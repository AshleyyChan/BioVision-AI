import { useEffect, useState, useCallback, useRef } from "react";
import { ANALYSIS_STATUS } from "../utils/constants";
import uploadApi from "../api/upload.api";
import analyzeApi from "../api/analyze.api";
import dayApi from "../api/day.api";

/**
 * useDayAnalysis
 * --------------
 * Specimen-scoped, SINGLE-DAY analysis hook.
 *
 * Canonical source:
 * - backend day.json
 * This hook ONLY mirrors backend state and
 * issues commands to mutate it.
 */
const useDayAnalysis = ({ studyId, specimenId, day }) => {
  const [imagePath, setImagePath] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState(ANALYSIS_STATUS.IDLE);
  const [uploading, setUploading] = useState(false);

  // Prevent stale async writes
  const activeDayRef = useRef(day?.day_id);

  /* -------------------------------------------------- */
  /* Sync from backend (CANONICAL)                       */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!day?.day_id) {
      activeDayRef.current = null;
      setImagePath(null);
      setAnalysis(null);
      setStatus(ANALYSIS_STATUS.IDLE);
      return;
    }

    activeDayRef.current = day.day_id;
    setImagePath(day.image_path ?? null);
    setAnalysis(day.analysis ?? null);

    if (day.analysis) {
      setStatus(ANALYSIS_STATUS.COMPLETED);
    } else {
      setStatus(ANALYSIS_STATUS.IDLE);
    }
  }, [day?.day_id, day?.image_path, day?.analysis]);

  /* -------------------------------------------------- */
  /* Upload image                                       */
  /* -------------------------------------------------- */
  const uploadImage = useCallback(
    async (file) => {
      if (!file || !studyId || !specimenId || !day?.day_id) {
        return null;
      }

      const currentDayId = day.day_id;

      try {
        setUploading(true);

        const response = await uploadApi.uploadSpecimenImage(
          file,
          studyId,
          specimenId,
          currentDayId
        );

        const path = response?.data?.imagePath ?? null;
        if (!path) return null;

        // Persist image path
        await dayApi.updateDay({
          study_id: studyId,
          specimen_id: specimenId,
          day_id: currentDayId,
          data: { image_path: path },
        });

        if (activeDayRef.current !== currentDayId) return null;

        setImagePath(path);
        return path;
      } catch (err) {
        console.error("Day image upload failed", err);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [studyId, specimenId, day?.day_id]
  );

  /* -------------------------------------------------- */
  /* Run per-day analysis                               */
  /* -------------------------------------------------- */
  const runAnalysis = useCallback(async () => {
    if (!imagePath || !day?.day_id) return null;

    const currentDayId = day.day_id;

    try {
      setStatus(ANALYSIS_STATUS.RUNNING);

      // ✅ EXPLICIT API CONTRACT
      const response = await analyzeApi.runDayAnalysis(imagePath);

      const result = response?.data?.analysis ?? null;

      if (!result) {
        setStatus(ANALYSIS_STATUS.FAILED);
        return null;
      }

      // Persist analysis result
      await dayApi.updateDay({
        study_id: studyId,
        specimen_id: specimenId,
        day_id: currentDayId,
        data: { analysis: result },
      });

      if (activeDayRef.current !== currentDayId) return null;

      setAnalysis(result);
      setStatus(ANALYSIS_STATUS.COMPLETED);
      return result;
    } catch (err) {
      console.error("Day analysis failed", err);
      if (err.response) {
          console.error("Day analysis error data:", err.response.data);
          console.error("Day analysis error status:", err.response.status);
      }
      setStatus(ANALYSIS_STATUS.FAILED);
      return null;
    }
  }, [imagePath, studyId, specimenId, day?.day_id]);

  return {
    imagePath,
    uploadImage,
    runAnalysis,
    status,
    analysis,
    uploading,
  };
};

export default useDayAnalysis;
