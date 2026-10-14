import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import studyApi from "../api/study.api";

const StudyContext = createContext(null);

export const StudyProvider = ({ children }) => {
  const [studies, setStudies] = useState([]);
  const [activeStudy, setActiveStudy] = useState(null);
  const [studyMeta, setStudyMeta] = useState(null);
  const [loadingStudy, setLoadingStudy] = useState(false);

  /* -------------------------------------------------- */
  /* Manual selection                                   */
  /* -------------------------------------------------- */
  const selectStudy = useCallback((study) => {
    if (!study) {
      setActiveStudy(null);
      setStudyMeta(null);
      return;
    }

    if (typeof study === "string") {
      setActiveStudy(study);
      return;
    }

    setActiveStudy(study.study_id);
    setStudyMeta(study);
  }, []);

  /* -------------------------------------------------- */
  /* Rehydrate / Load Study by ID                        */
  /* -------------------------------------------------- */
  const loadStudy = useCallback(async (studyId) => {
    if (!studyId) return null;

    if (studyMeta && studyMeta.study_id === studyId && activeStudy === studyId) {
      return studyMeta;
    }

    try {
      setLoadingStudy(true);
      setActiveStudy(studyId);
      const res = await studyApi.getStudy(studyId);
      const studyData = res?.data ?? null;
      if (studyData) {
        setStudyMeta(studyData);
      }
      return studyData;
    } catch (err) {
      console.error("Failed to load study by ID:", err);
      return null;
    } finally {
      setLoadingStudy(false);
    }
  }, [studyMeta, activeStudy]);

  const value = useMemo(
    () => ({
      studies,
      setStudies,
      activeStudy,
      setActiveStudy,
      studyMeta,
      setStudyMeta,
      selectStudy,
      loadStudy,
      loadingStudy,
    }),
    [studies, activeStudy, studyMeta, selectStudy, loadStudy, loadingStudy]
  );

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudyContext = () => {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error(
      "useStudyContext must be used within StudyProvider"
    );
  }
  return ctx;
};
