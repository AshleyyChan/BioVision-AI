import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";

import ImageUploader from "../../images/ImageUploader";
import AnalysisPanel from "../../analysis/AnalysisPanel";
import DayAnalysisResult from "./DayAnalysisResult";
import Loader from "../../common/Loader";
import Input from "../../common/Input";
import Button from "../../common/Button";

import { useSpecimenContext } from "../../../context/SpecimenContext";
import { useStudyContext } from "../../../context/StudyContext";
import useDayAnalysis from "../../../hooks/useDayAnalysis";
import dayApi from "../../../api/day.api";
import { ANALYSIS_STATUS } from "../../../utils/constants";

/**
 * DayWorkspace
 * ------------
 * Canonical single-day editor + analysis runner.
 */
const DayWorkspace = ({ day, studyId: propStudyId, specimenId: propSpecimenId }) => {
  /* ---------------- CANONICAL IDS ---------------- */

  const { activeStudy } = useStudyContext();
  const {
    activeSpecimen,
    updateDayImage,
    updateDayMetadata,
  } = useSpecimenContext();

  const studyId = propStudyId || activeStudy;
  const specimenId = propSpecimenId || activeSpecimen;

  /* ---------------- HARD GUARD ---------------- */

  if (!studyId || !specimenId || !day?.day_id) {
    return (
      <div style={styles.loadingContainer}>
        <Loader />
      </div>
    );
  }

  /* ---------------- Local editable state ---------------- */

  const [concentration, setConcentration] = useState("");
  const [level, setLevel] = useState("");
  const [unit, setUnit] = useState("mM");
  const [temperature, setTemperature] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [saving, setSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  /* ---------------- Sync from backend day ---------------- */

  useEffect(() => {
    setConcentration(day.concentration ?? "");
    setLevel(day.level ?? "");
    setUnit(day.unit ?? "mM");
    setTemperature(day.temperature ?? "");
    setTreatmentType(day.treatment_type ?? "");
  }, [day]);

  /* ---------------- Cleanup preview URLs ---------------- */

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  /* ---------------- Dirty detection ---------------- */

  const isDirty = useMemo(() => {
    return (
      concentration !== (day.concentration ?? "") ||
      level !== (day.level ?? "") ||
      unit !== (day.unit ?? "mM") ||
      temperature !== (day.temperature ?? "") ||
      treatmentType !== (day.treatment_type ?? "")
    );
  }, [
    concentration,
    level,
    unit,
    temperature,
    treatmentType,
    day,
  ]);

  /* ---------------- Analysis hook ---------------- */

  const {
    imagePath,
    uploadImage,
    runAnalysis,
    status,
    analysis,
    uploading,
  } = useDayAnalysis({
    studyId,
    specimenId,
    day,
  });

  /* ---------------- Image upload ---------------- */

  const handleImageUpload = useCallback(
    async (files) => {
      if (!files?.length) return;

      const file = files[0];
      setLocalPreview(URL.createObjectURL(file));

      const path = await uploadImage(file);
      if (path) {
        updateDayImage(day.day_id, path);
        setLocalPreview(null);
      }
    },
    [day.day_id, uploadImage, updateDayImage]
  );

  /* ---------------- Save metadata ---------------- */

  const handleSaveChanges = async () => {
    try {
      setSaving(true);

      await dayApi.updateDay({
        study_id: studyId,
        specimen_id: specimenId,
        day_id: day.day_id,
        data: {
          concentration,
          level,
          unit,
          temperature,
          treatmentType,
        },
      });

      updateDayMetadata(day.day_id, {
        concentration,
        level,
        unit,
        temperature,
        treatment_type: treatmentType,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Run analysis ---------------- */

  const handleRunAnalysis = useCallback(async () => {
    await runAnalysis();
  }, [runAnalysis]);

  /* ---------------- Image resolution ---------------- */

  // 🔍 DEBUG: Log the resolved image path
  useEffect(() => {
    if (imagePath) console.log("DayWorkspace imagePath:", imagePath);
  }, [imagePath]);

  const resolvedImage = useMemo(() => {
    if (localPreview) return localPreview;
    if (!imagePath) return null;

    // Handle both relative and absolute paths
    if (imagePath.startsWith("http")) return imagePath;

    // Fallback: If proxy isn't updating fast enough, try direct backend URL
    // BUT normally relative path should work with proxy
    return imagePath;
  }, [localPreview, imagePath]);

  /* ---------------- Render ---------------- */

  return (
    <div style={styles.workspace}>
      <div style={styles.header}>
        <h1 style={styles.dayTitle}>
          {day.label || "Unnamed Day"}
        </h1>
        <p style={styles.subtitle}>
          Enter experimental parameters, upload specimen image,
          and run single-day morphological analysis.
        </p>
      </div>

      <Section title="Experiment Details">
        <FieldHint>
          Enter the liquid or buffering method used during the experiment.
        </FieldHint>
        <Input
          label="Concentration Method"
          placeholder="e.g. H₂O₂, PBS buffer, culture medium"
          value={concentration}
          onChange={(e) => setConcentration(e.target.value)}
        />

        <FieldHint>
          Enter the numeric concentration level and select the unit
          (millimolar or micromolar).
        </FieldHint>
        <div style={styles.row}>
          <Input
            label="Concentration Level"
            placeholder="e.g. 0.5, 2.0, 10"

            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={styles.select}
          >
            <option value="mM">Millimolar (mM)</option>
            <option value="µM">Micromolar (µM)</option>
          </select>
        </div>

        <FieldHint>
          Enter the temperature (in °C) at which the specimen
          was maintained during this day.
        </FieldHint>
        <Input
          label="Temperature (°C)"
          placeholder="e.g. 25, 37"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
        />

        <FieldHint>
          Select exactly one biological phase for this day.
          Only the predefined options are allowed.
        </FieldHint>
        <select
          value={treatmentType}
          onChange={(e) => setTreatmentType(e.target.value)}
          style={styles.select}
        >
          <option value="">Select treatment type</option>
          <option value="Adapting">Adapting</option>
          <option value="Disease Infusion">
            Disease Infusion
          </option>
          <option value="Treatment">Treatment</option>
        </select>
      </Section>

      <Section title="Specimen Image">
        <FieldHint>
          Upload a microscopic image of the specimen for this day.
          This image will be used for morphological analysis.
        </FieldHint>
        <div style={styles.imageBox}>
          {!resolvedImage && !uploading && (
            <ImageUploader onUpload={handleImageUpload} />
          )}
          {uploading && <Loader />}
          {resolvedImage && (
            <img
              src={resolvedImage}
              alt="Specimen"
              style={styles.imagePreview}
            />
          )}
        </div>
      </Section>

      <Section title="Analysis">
        <FieldHint>
          The analysis calculates length, breadth, and area.
          If inflammation is detected, the system classifies
          tissue behavior as bulging, elongating, or shrinking.
        </FieldHint>
        <AnalysisPanel
          imageCount={resolvedImage ? 1 : 0}
          status={status}
          onRunAnalysis={handleRunAnalysis}
        />
      </Section>

      <Section title="Results">
        <DayAnalysisResult
          status={status}
          analysis={analysis ?? day.analysis}
        />
      </Section>

      <div style={styles.saveBar}>
        <Button
          onClick={handleSaveChanges}
          disabled={!isDirty || saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {status === ANALYSIS_STATUS.RUNNING && <Loader />}
    </div>
  );
};

export default React.memo(DayWorkspace);

/* ---------------- Helpers ---------------- */

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>{title}</h3>
    {children}
  </div>
);

const FieldHint = ({ children }) => (
  <div style={styles.hint}>{children}</div>
);

/* ---------------- Styles ---------------- */

const styles = {
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  workspace: {
    padding: "32px 36px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    overflowY: "auto",
  },
  header: {
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  dayTitle: {
    fontSize: "30px",
    fontWeight: 700,
    color: "#fff",
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
  },
  section: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  sectionTitle: {
    fontSize: "13px",
    color: "#fff",
  },
  hint: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.4,
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
  },
  imageBox: {
    minHeight: "260px",
    border: "1px dashed rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: "420px",
    objectFit: "contain",
  },
  saveBar: {
    position: "sticky",
    bottom: 0,
    display: "flex",
    justifyContent: "flex-end",
    padding: "16px",
  },
};
