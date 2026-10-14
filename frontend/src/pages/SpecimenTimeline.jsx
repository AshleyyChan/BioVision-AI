import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useStudyContext } from "../context/StudyContext";
import useSpecimens from "../hooks/useSpecimens";
import specimenApi from "../api/specimen.api";

import SpecimenList from "../components/specimen/SpecimenList";
import CreateSpecimenModal from "../components/specimen/CreateSpecimenModal";
import EditSpecimenModal from "../components/specimen/EditSpecimenModal";
import ConfirmDeleteSpecimenModal from "../components/specimen/ConfirmDeleteSpecimenModal";
import Button from "../components/common/Button";
import BackBox from "../components/common/BackBox";

/**
 * SpecimenTimeline
 * ----------------
 * Workspace AFTER opening a study.
 *
 * Responsibilities:
 * - Display study metadata
 * - List specimens
 * - Create / edit / delete specimens
 * - Navigate to SpecimenWorkspace
 *
 * ❌ No day logic
 * ❌ No analysis
 */
const SpecimenTimeline = () => {
  const navigate = useNavigate();
  const { studyId: routeStudyId } = useParams();

  const { studyMeta, activeStudy, loadStudy, loadingStudy } = useStudyContext();
  const currentStudyId = routeStudyId || activeStudy;

  const { fetchSpecimens, createSpecimen, selectSpecimen } =
    useSpecimens();

  const [specimens, setSpecimens] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* -------------------------------------------------- */
  /* Rehydrate study from URL if needed                  */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (routeStudyId && (!studyMeta || studyMeta.study_id !== routeStudyId)) {
      loadStudy(routeStudyId);
    }
  }, [routeStudyId, studyMeta, loadStudy]);

  /* -------------------------------------------------- */
  /* Load specimens                                     */
  /* -------------------------------------------------- */
  const loadSpecimens = useCallback(async () => {
    if (!currentStudyId) return;

    try {
      const res = await specimenApi.getSpecimens(currentStudyId);
      const data = res?.data;
      if (Array.isArray(data)) {
        setSpecimens(data);
      }
    } catch (err) {
      console.error("Error loading specimens", err);
    }
  }, [currentStudyId]);

  useEffect(() => {
    loadSpecimens();
  }, [loadSpecimens]);

  /* -------------------------------------------------- */
  /* Create specimen                                    */
  /* -------------------------------------------------- */
  const handleCreateSpecimen = async (data) => {
    const specimen = await createSpecimen(data);
    if (!specimen) return;

    setShowCreate(false);
    await loadSpecimens();

    // ✅ store ONLY the ID
    selectSpecimen(specimen.specimen_id);

    navigate(
      `/study/${activeStudy}/specimen/${specimen.specimen_id}`
    );
  };

  /* -------------------------------------------------- */
  /* Edit specimen                                      */
  /* -------------------------------------------------- */
  const handleSaveEdit = async (updated) => {
    try {
      await specimenApi.updateSpecimen(
        activeStudy,
        updated.specimen_id,
        { name: updated.name }
      );

      setEditTarget(null);
      await loadSpecimens();
    } catch (err) {
      console.error(err);
      alert("Failed to update specimen.");
    }
  };

  /* -------------------------------------------------- */
  /* Delete specimen                                    */
  /* -------------------------------------------------- */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await specimenApi.deleteSpecimen(
        activeStudy,
        deleteTarget.specimen_id
      );

      setDeleteTarget(null);
      await loadSpecimens();
    } catch (err) {
      console.error(err);
      alert("Failed to delete specimen.");
    }
  };

  /* -------------------------------------------------- */
  /* Guards                                             */
  /* -------------------------------------------------- */
  if (loadingStudy) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          Loading study details…
        </div>
      </div>
    );
  }

  if (!studyMeta) {
    return (
      <div style={styles.container}>
        <BackBox label="Back to Studies" onClick={() => navigate("/studies")} />
        <div className="empty-state">
          Study not found or no study selected.
        </div>
      </div>
    );
  }

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */
  return (
    <div style={styles.container}>
      {/* Back */}
      <BackBox label="Back to Studies" />

      {/* ================= Study Card ================= */}
      <div style={styles.studyCard}>
        <h2 style={styles.studyTitle}>
          {studyMeta.title}
        </h2>

        <div style={styles.metaRow}>
          <span>
            <strong>Researcher:</strong>{" "}
            {studyMeta.researcherName || "—"}
          </span>
          <span>
            <strong>Experiment Time:</strong>{" "}
            {studyMeta.date || "—"} {studyMeta.time || ""}
          </span>
          <span>
            <strong>Specimens:</strong>{" "}
            {specimens.length}
          </span>
        </div>

        {/* ================= Specimens ================= */}
        <div style={styles.specimenSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              Specimens
            </h3>

            <Button
              onClick={() => setShowCreate(true)}
            >
              + Add Specimen
            </Button>
          </div>

          <SpecimenList
            specimens={specimens}
            onSelect={(specimen) => {
              // ✅ ONLY ID enters context
              selectSpecimen(specimen.specimen_id);

              navigate(
                `/study/${activeStudy}/specimen/${specimen.specimen_id}`
              );
            }}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      {/* ================= Modals ================= */}
      {showCreate && (
        <CreateSpecimenModal
          onCreate={handleCreateSpecimen}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <EditSpecimenModal
          specimen={editTarget}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteSpecimenModal
          specimen={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default SpecimenTimeline;

/* -------------------------------------------------- */
/* Styles                                             */
/* -------------------------------------------------- */

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    paddingBottom: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  studyCard: {
    padding: "26px 28px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    flexDirection: "column",
    gap: "26px",
  },

  studyTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#ffffff",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    fontSize: "14px",
    color: "#e5e7eb",
  },

  specimenSection: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#ffffff",
  },
};
