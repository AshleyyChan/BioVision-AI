"""
image_compare.py
----------------
Standalone IMAGE-TO-IMAGE comparison service.

Pipeline:
1. Preprocess
2. Segment gland
3. Extract features
4. Compare features
5. Determine overall biological status

Used by:
- Image Comparison tool ONLY
"""

from pathlib import Path
from typing import Dict

import cv2
import numpy as np

from app.ml.preprocessing import ImagePreprocessor
from app.ml.segmentation import ProstateSegmenter
from app.services.day_analysis import DayAnalysisService


class ImageCompareService:
    def __init__(self):
        self.preprocessor = ImagePreprocessor()
        self.segmenter = ProstateSegmenter()
        self.day_analysis_service = DayAnalysisService()

    # --------------------------------------------------
    # Public API
    # --------------------------------------------------

    def compare(
        self,
        image_path_a: Path,
        image_path_b: Path,
    ) -> Dict:

        # --------------------------------------------------
        # 1️⃣ Preprocessing
        # --------------------------------------------------
        image_a = self.preprocessor.preprocess(image_path_a)
        image_b = self.preprocessor.preprocess(image_path_b)

        # --------------------------------------------------
        # 2️⃣ Segmentation
        # --------------------------------------------------
        gray_a = cv2.cvtColor(image_a, cv2.COLOR_RGB2GRAY)
        gray_b = cv2.cvtColor(image_b, cv2.COLOR_RGB2GRAY)

        mask_a = self.segmenter.segment(gray_a)
        mask_b = self.segmenter.segment(gray_b)

        if cv2.countNonZero(mask_a) == 0:
            raise ValueError("No gland detected in image A")

        if cv2.countNonZero(mask_b) == 0:
            raise ValueError("No gland detected in image B")

        # --------------------------------------------------
        # 3️⃣ Feature extraction
        # --------------------------------------------------
        length_a, width_a = self._major_minor_axes(mask_a)
        length_b, width_b = self._major_minor_axes(mask_b)

        length_change = self._percent_change(length_a, length_b)
        width_change = self._percent_change(width_a, width_b)

        intensity_a = float(np.mean(gray_a[mask_a > 0]))
        intensity_b = float(np.mean(gray_b[mask_b > 0]))

        intensity_change = self._percent_change(intensity_a, intensity_b)

        lab_a = cv2.cvtColor(image_a, cv2.COLOR_RGB2LAB)
        lab_b = cv2.cvtColor(image_b, cv2.COLOR_RGB2LAB)

        color_a = np.mean(lab_a[mask_a > 0][:, 1:], axis=0)
        color_b = np.mean(lab_b[mask_b > 0][:, 1:], axis=0)

        color_change = float(np.linalg.norm(color_b - color_a))

        # --------------------------------------------------
        # 4️⃣ Detailed per-image metrics (Refined Logic)
        # --------------------------------------------------
        try:
            metrics_a = self.day_analysis_service.analyze(image_path_a)
        except Exception as e:
            print(f"Warning: Failed to analyze Image A: {e}")
            metrics_a = {}

        try:
            metrics_b = self.day_analysis_service.analyze(image_path_b)
        except Exception as e:
            print(f"Warning: Failed to analyze Image B: {e}")
            metrics_b = {}

        # --------------------------------------------------
        # 5️⃣ Return results
        # --------------------------------------------------
        area_a = metrics_a.get("area", 0)
        area_b = metrics_b.get("area", 0)
        area_change = self._percent_change(area_a, area_b) if area_a > 0 else 0

        solidity_a = metrics_a.get("solidity", 0)
        solidity_b = metrics_b.get("solidity", 0)
        solidity_change = self._percent_change(solidity_a, solidity_b) if solidity_a > 0 else 0

        overall_status, morphology = self._determine_status(
            length_change,
            width_change,
            intensity_change,
            area_change,
            solidity_change
        )

        return {
            "length_change_percent": round(length_change, 2),
            "width_change_percent": round(width_change, 2),
            "intensity_change_percent": round(intensity_change, 2),
            "area_change_percent": round(area_change, 2),
            "color_change_score": round(color_change, 2),
            "overall_status": overall_status,
            "morphology_change": morphology,
            "image_a_metrics": metrics_a,
            "image_b_metrics": metrics_b,
        }

    # ==================================================
    # Interpretation logic (Surgical)
    # ==================================================

    def _determine_status(
        self,
        l_chg: float,
        w_chg: float,
        i_chg: float,
        a_chg: float,
        s_chg: float,
    ) -> tuple:
        """
        Earthworm-specific delta interpretation.
        """

        # 1. Overall Biological Response
        if a_chg > 20 or s_chg < -15:
            status = "Under Stress"
        elif abs(a_chg) > 8 or abs(l_chg) > 10 or abs(w_chg) > 10:
            status = "Adapting response"
        elif a_chg < -5 and s_chg > 5:
            status = "Regenerating"
        else:
            status = "Stable"

        # 2. Morphology Modifier
        morphology = "Intact"
        if a_chg > 5:
            if w_chg > l_chg + 5:
                morphology = "Bulged"
            elif l_chg > w_chg + 5:
                morphology = "Elongated"
            else:
                morphology = "Swollen"
        elif a_chg < -5:
            morphology = "Shrinked"

        return status, morphology

    # ==================================================
    # Helpers
    # ==================================================

    def _major_minor_axes(self, mask: np.ndarray):
        contours, _ = cv2.findContours(
            mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        if not contours:
            raise ValueError("No gland contour found")

        contour = max(contours, key=cv2.contourArea)
        w, h = cv2.minAreaRect(contour)[1]

        return float(max(w, h)), float(min(w, h))

    def _percent_change(self, a: float, b: float) -> float:
        if a == 0:
            return 0.0 if b == 0 else 100.0
        return ((b - a) / a) * 100.0
