import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useStudies from "../hooks/useStudies";
import CreateStudyModal from "../components/study/CreateStudyModal";
import EditStudyModal from "../components/study/EditStudyModal";
import ConfirmDeleteModal from "../components/study/ConfirmDeleteModal";
import StudyList from "../components/study/StudyList";
import Button from "../components/common/Button";

/**
 * StudyManager
 * ------------
 * Central page for managing all studies.
 * Fully frontend-safe and backend-compatible.
 */
const StudyManager = () => {
  const navigate = useNavigate();

  const {
    fetchStudies,
    createStudy,
    updateStudy,
    deleteStudy,
    selectStudy,
  } = useStudies();

  const [studies, setStudies] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /* -------------------------------------------------- */
  /* Load studies                                       */
  /* -------------------------------------------------- */
  const loadStudies = async () => {
    const data = await fetchStudies();
    if (Array.isArray(data)) {
      setStudies(data);
    }
  };

  useEffect(() => {
    loadStudies();
  }, []);

  /* -------------------------------------------------- */
  /* Create study                                      */
  /* -------------------------------------------------- */
  const handleCreateStudy = async (data) => {
    if (!data) return;
    await createStudy(data);
    setShowCreate(false);
    await loadStudies();
  };

  /* -------------------------------------------------- */
  /* Update study                                      */
  /* -------------------------------------------------- */
  const handleSaveStudy = async (updatedStudy) => {
    if (!updatedStudy) return;
    await updateStudy(updatedStudy);
    setEditingStudy(null);
    await loadStudies();
  };

  /* -------------------------------------------------- */
  /* Delete study (two-step)                            */
  /* -------------------------------------------------- */
  const requestDeleteStudy = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStudy = async () => {
    if (!editingStudy) return;

    await deleteStudy(editingStudy.study_id);
    setShowDeleteConfirm(false);
    setEditingStudy(null);
    await loadStudies();

    navigate("/studies");
  };

  /* -------------------------------------------------- */
  /* Render                                            */
  /* -------------------------------------------------- */
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Study Manager</h2>
          <p style={styles.subtitle}>
            Create, organize, and access biological studies
          </p>
        </div>

        <Button onClick={() => setShowCreate(true)}>
          + New Study
        </Button>
      </div>

      {/* Study list */}
      <StudyList
        studies={studies}
        onSelect={(study) => {
          selectStudy(study);
          navigate(`/study/${study.study_id}`);
        }}
        onEdit={(study) => setEditingStudy(study)}
      />

      {/* Create modal */}
      {showCreate && (
        <CreateStudyModal
          onCreate={handleCreateStudy}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit modal */}
      {editingStudy && (
        <EditStudyModal
          study={editingStudy}
          onSave={handleSaveStudy}
          onDelete={requestDeleteStudy}
          onClose={() => setEditingStudy(null)}
        />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && editingStudy && (
        <ConfirmDeleteModal
          title={editingStudy.title}
          onConfirm={confirmDeleteStudy}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default StudyManager;

/* -------------------------------------------------- */
/* Styles                                             */
/* -------------------------------------------------- */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "36px",
    maxWidth: "1200px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
  },

  title: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#ffffff",
  },

  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    marginTop: "4px",
  },
};
