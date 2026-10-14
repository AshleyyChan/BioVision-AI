"""
feature_extraction.py
---------------------
Extract quantitative morphological features from segmented prostate gland.

Input:
- Grayscale image (numpy array)
- Binary segmentation mask

Output:
- Dictionary of biologically meaningful features

❌ No UI logic
❌ No fake values
"""

import cv2
import numpy as np
import math
from typing import Dict

from app.core.config import PIXEL_TO_MM_RATIO


class FeatureExtractor:
    """
    Extracts morphological and intensity-based features
    from a segmented prostate gland.
    """

    # --------------------------------------------------
    # Public API
    # --------------------------------------------------

    def extract(
        self,
        gray_image: np.ndarray,
        mask: np.ndarray
    ) -> Dict[str, float]:
        """
        Main feature extraction pipeline.

        Raises:
        - ValueError if segmentation is invalid
        """

        contour = self._get_contour(mask)
        if contour is None:
            raise ValueError(
                "No valid gland contour found in segmentation mask"
            )

        features: Dict[str, float] = {}

        # Morphological
        features.update(self._morphology_features(contour))

        # Shape irregularity
        features.update(self._shape_features(contour))

        # Intensity / inflammation
        features.update(self._intensity_features(gray_image, mask))

        return features

    # --------------------------------------------------
    # Internal helpers
    # --------------------------------------------------

    def _get_contour(self, mask: np.ndarray):
        if mask is None or mask.size == 0:
            return None

        # Normalize mask to uint8 binary
        mask_bin = (mask > 0).astype(np.uint8)

        contours, _ = cv2.findContours(
            mask_bin,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        if not contours:
            return None

        # Use largest contour (main gland)
        return max(contours, key=cv2.contourArea)

    # --------------------------------------------------
    # Feature groups
    # --------------------------------------------------

    def _morphology_features(self, contour) -> Dict[str, float]:
        """
        Size-related gland features using Minimum Area Rectangle
        for rotation-independent accuracy.
        """

        area = cv2.contourArea(contour)

        # minAreaRect returns ((center_x, center_y), (width, height), angle)
        rect = cv2.minAreaRect(contour)
        (_, (w, h), _) = rect
        
        # Canonical: length is the major axis, breadth is the minor axis
        length = max(w, h) * PIXEL_TO_MM_RATIO
        breadth = min(w, h) * PIXEL_TO_MM_RATIO
        area_mm2 = area * (PIXEL_TO_MM_RATIO ** 2)

        return {
            "area": float(area_mm2),
            "length": float(length),
            "breadth": float(breadth),
        }

    def _shape_features(self, contour) -> Dict[str, float]:
        """
        Shape irregularity reflects inflammation or stress.
        """

        perimeter = cv2.arcLength(contour, True)
        area = cv2.contourArea(contour)

        if perimeter <= 0:
            raise ValueError("Invalid contour perimeter")

        circularity = (
            4.0 * math.pi * area / (perimeter ** 2)
        )

        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        if hull_area <= 0:
            raise ValueError("Invalid convex hull area")

        solidity = area / hull_area

        # Irregularity index (higher = worse)
        irregularity = 1.0 - circularity

        return {
            "circularity": float(circularity),
            "solidity": float(solidity),
            "shape_irregularity": float(irregularity),
        }

    def _intensity_features(
        self,
        gray_image: np.ndarray,
        mask: np.ndarray
    ) -> Dict[str, float]:
        """
        Pixel intensity statistics inside gland ROI.
        Refined for earthworm microscopy:
        - Shrinks mask by 2px to avoid shadow bleed at the boundary.
        - Applies post-segmentation CLAHE to normalize lighting heterogeneity.
        - Excludes top/bottom 5% to ignore glare.
        """

        if gray_image is None or gray_image.size == 0:
            raise ValueError("Invalid grayscale image")

        # 1. Post-Segmentation CLAHE
        # Normalize the luminance range across the image before extraction
        # to stabilize local lighting variations (heterogeneity).
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        norm_gray = clahe.apply(gray_image)

        # 2. ROI Triage: Erode mask to ensure we only measure internal tissue
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        tight_mask = cv2.erode(mask, kernel, iterations=2)
        
        mask_bin = tight_mask > 0
        gland_pixels = norm_gray[mask_bin].astype(float)

        if gland_pixels.size < 10:
            # Fallback to original mask if erosion was too aggressive
            gland_pixels = norm_gray[mask > 0].astype(float)

        if gland_pixels.size < 1:
            raise ValueError("No pixels found for intensity analysis")

        # 3. Outlier Clipping (Glare Mitigation)
        p5, p95 = np.percentile(gland_pixels, [5, 95])
        clipped_pixels = gland_pixels[(gland_pixels >= p5) & (gland_pixels <= p95)]

        if clipped_pixels.size == 0:
            clipped_pixels = gland_pixels

        # 4. Final Normalization
        p_min, p_max = np.min(clipped_pixels), np.max(clipped_pixels)
        if p_max > p_min:
            pixels_out = (clipped_pixels - p_min) / (p_max - p_min) * 255
        else:
            pixels_out = clipped_pixels

        return {
            "mean_intensity": float(np.mean(pixels_out)),
            "intensity_std": float(np.std(pixels_out)),
        }
