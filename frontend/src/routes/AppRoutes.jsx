import React from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

// Pages
import Welcome from "../pages/Welcome";
import StudyManager from "../pages/StudyManager";
import SpecimenTimeline from "../pages/SpecimenTimeline";
import SpecimenWorkspace from "../pages/SpecimenWorkspace";
import ImageCompare from "../pages/ImageCompare";
import Formulas from "../pages/Formulas";
import Aboutus from "../pages/Aboutus";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ROOT LAYOUT */}
      <Route path="/" element={<AppLayout />}>

        {/* LANDING */}
        <Route index element={<Welcome />} />

        {/* STUDIES */}
        <Route path="studies" element={<StudyManager />} />

        {/* STUDY WORKSPACE */}
        <Route
          path="study/:studyId"
          element={<SpecimenTimeline />}
        />

        {/* SPECIMEN WORKSPACE */}
        <Route
          path="study/:studyId/specimen/:specimenId"
          element={<SpecimenWorkspace />}
        />

        {/* UTILITIES */}
        <Route path="image-compare" element={<ImageCompare />} />
        <Route path="formulas" element={<Formulas />} />
        <Route path="about" element={<Aboutus />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
