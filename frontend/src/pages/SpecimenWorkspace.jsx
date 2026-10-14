import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

import DaySidebar from "../components/specimen/timeline/DaySidebar";
import DayWorkspace from "../components/specimen/timeline/DayWorkspace";
import MultiDayAnalysis from "../components/specimen/timeline/MultiDayAnalysis";
import BackBox from "../components/common/BackBox";

import { useStudyContext } from "../context/StudyContext";
import { useSpecimenContext } from "../context/SpecimenContext";
import useMultiDayAnalysis from "../hooks/useMultiDayAnalysis";
import dayApi from "../api/day.api";

/**
 * SpecimenWorkspace
 * -----------------
 * Workspace for a SINGLE specimen.
 *
 * Study → Specimen → Days
 */
const SpecimenWorkspace = () => {
  const navigate = useNavigate();
  const { studyId, specimenId } = useParams();

  const { activeStudy, setActiveStudy, loadStudy } = useStudyContext();

  const {
    activeSpecimen,
    days,
    activeDayId,
    setActiveDay,
    setActiveSpecimen,
    replaceDays,
    addDay,
    removeDay, // ✅ must exist in SpecimenContext
  } = useSpecimenContext();

  /* -------------------------------------------------- */
  /* HARD GUARD                                          */
  /* -------------------------------------------------- */
  if (!studyId || !specimenId) {
    return (
      <div className="empty-state">
        <p>Invalid study or specimen.</p>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* 🔑 REHYDRATE CONTEXT FROM URL                        */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (studyId && activeStudy !== studyId) {
      setActiveStudy(studyId);
      loadStudy(studyId);
    }
    if (specimenId && activeSpecimen !== specimenId) {
      setActiveSpecimen(specimenId);
    }
  }, [
    studyId,
    specimenId,
    activeStudy,
    activeSpecimen,
    setActiveStudy,
    loadStudy,
    setActiveSpecimen,
  ]);

  /* -------------------------------------------------- */
  /* Load days for specimen                              */
  /* -------------------------------------------------- */
  useEffect(() => {
    const loadDays = async () => {
      if (!studyId || !specimenId) return;

      try {
        const response = await dayApi.getDays({
          study_id: studyId,
          specimen_id: specimenId,
        });

        replaceDays(response?.data ?? []);
      } catch (err) {
        console.error("Failed to load days:", err);
      }
    };

    loadDays();
  }, [studyId, specimenId, replaceDays]);

  /* -------------------------------------------------- */
  /* Multi-day selection                                 */
  /* -------------------------------------------------- */
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDaySelection = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  /* -------------------------------------------------- */
  /* Create Day                                          */
  /* -------------------------------------------------- */
  const handleCreateDay = useCallback(
    async (dayData) => {
      const response = await dayApi.createDay({
        study_id: studyId,
        specimen_id: specimenId,
        data: dayData,
      });

      const createdDay = response?.data;

      if (createdDay?.day_id) {
        addDay(createdDay);
        setActiveDay(createdDay.day_id);
      }
    },
    [studyId, specimenId, addDay, setActiveDay]
  );

  /* -------------------------------------------------- */
  /* View Mode (Timeline vs Analysis)                    */
  /* -------------------------------------------------- */
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "analysis"

  /* -------------------------------------------------- */
  /* Multi-day analysis                                  */
  /* -------------------------------------------------- */
  const multiDay = useMultiDayAnalysis();

  const handleMultiDayAnalysis = () => {
    if (selectedDays.length < 2) return;

    const resolvedDays = days.filter((d) =>
      selectedDays.includes(d.day_id)
    );

    multiDay.runMultiDayAnalysis(resolvedDays);
    setViewMode("analysis"); // 🚀 Switch to analysis view
  };

  useEffect(() => {
    multiDay.reset();
    if (selectedDays.length < 2) {
      setViewMode("timeline"); // Auto-revert if selection invalid
    }
  }, [selectedDays, multiDay.reset]);

  /* -------------------------------------------------- */
  /* Reset day selection when specimen changes           */
  /* -------------------------------------------------- */
  useEffect(() => {
    setSelectedDays([]);
    setActiveDay(null);
    setViewMode("timeline");
  }, [specimenId, setActiveDay]);

  /* -------------------------------------------------- */
  /* Active day resolution                               */
  /* -------------------------------------------------- */
  const activeDay = useMemo(
    () => days.find((d) => d.day_id === activeDayId) || null,
    [days, activeDayId]
  );

  /* -------------------------------------------------- */
  /* Handle Deletion of Day                              */
  /* -------------------------------------------------- */
  const handleDeleteDay = async (day) => {
    try {
      await dayApi.deleteDay({
        study_id: studyId,
        specimen_id: specimenId,
        day_id: day.day_id,
      });
      removeDay(day.day_id);
    } catch (error) {
      console.error("Error deleting day", error);
      alert("Failed to delete day");
    }
  };

  /* -------------------------------------------------- */
  /* Back navigation                                     */
  /* -------------------------------------------------- */
  const handleBack = useCallback(() => {
    setActiveSpecimen(null);
    navigate(`/study/${studyId}`);
  }, [navigate, setActiveSpecimen, studyId]);

  /* -------------------------------------------------- */
  /* Render                                              */
  /* -------------------------------------------------- */
  return (
    <div style={styles.container}>
      <BackBox
        label="Back to Specimens"
        onClick={handleBack}
      />

      <div style={styles.content}>
        {/* ========= View Mode: TIMELINE ========= */}
        {viewMode === "timeline" && (
          <>
            <DaySidebar
              days={days}
              activeDayId={activeDayId}
              selectedDays={selectedDays}
              onDaySelect={setActiveDay}
              onToggleSelect={toggleDaySelection}
              onAnalyseSelected={handleMultiDayAnalysis}
              onCreateDay={handleCreateDay}
              onDeleteDay={handleDeleteDay}
            />

            <div style={styles.workspace}>
              {activeDay && (
                <DayWorkspace
                  day={activeDay}
                  studyId={studyId}
                  specimenId={specimenId}
                />
              )}

              {!activeDay && days.length === 0 && (
                <div className="empty-state">
                  <p>Create a day to begin analysis.</p>
                </div>
              )}

              {!activeDay && days.length > 0 && (
                <div className="empty-state">
                  <p>Select a day to view.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ========= View Mode: ANALYSIS (Full Width) ========= */}
        {viewMode === "analysis" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setViewMode("timeline")}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Timeline
              </button>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Longitudinal Analysis</h2>
            </div>

            <MultiDayAnalysis
              status={multiDay.status}
              results={multiDay.results}
              error={multiDay.error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecimenWorkspace;

/* -------------------------------------------------- */
/* Styles                                             */
/* -------------------------------------------------- */

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    paddingBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  content: {
    display: "flex",
    gap: "24px",
    alignItems: "stretch",
  },

  workspace: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
};
