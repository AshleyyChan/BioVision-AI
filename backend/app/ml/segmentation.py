"""
segmentation.py
---------------
Prostate gland segmentation from preprocessed microscopic images.
"""

import cv2
import numpy as np


class ProstateSegmenter:
    """
    Prostate gland segmentation logic.
    """

    def __init__(
        self,
        threshold_method: str = "otsu",
        morph_kernel_size: int = 5,
    ):
        self.threshold_method = threshold_method
        self.morph_kernel_size = morph_kernel_size

    # --------------------------------------------------
    # Public API
    # --------------------------------------------------

    def segment(self, gray_image: np.ndarray) -> np.ndarray:
        """
        Full segmentation pipeline.

        Returns:
            Binary mask (uint8, values {0,255})
        """

        binary = self._threshold(gray_image)
        cleaned = self._morphological_cleanup(binary)
        mask = self._extract_largest_region(cleaned)

        return mask

    # --------------------------------------------------
    # Internal steps
    # --------------------------------------------------

    def _threshold(self, gray: np.ndarray) -> np.ndarray:
        """
        Convert grayscale image to binary using adaptive logic.
        """

        if self.threshold_method == "otsu":
            _, binary = cv2.threshold(
                gray,
                0,
                255,
                cv2.THRESH_BINARY + cv2.THRESH_OTSU,
            )
        else:
            _, binary = cv2.threshold(
                gray,
                127,
                255,
                cv2.THRESH_BINARY,
            )

        # Ensure gland is foreground (white)
        if np.mean(binary) > 127:
            binary = cv2.bitwise_not(binary)

        return binary.astype(np.uint8)

    def _morphological_cleanup(self, binary: np.ndarray) -> np.ndarray:
        """
        Aggressive cleanup for earthworm prostate:
        - Removes small noise bits.
        - Fills all internal gaps and holes.
        - Smooths edges to prevent artificial irregularity.
        """

        # 1. Close gaps and smooth boundary
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        
        # Open to remove tiny noise
        opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Close to bridge large gaps (typical in earthworm microscopy)
        closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=4)

        # 2. Total Hole Filling (Surgical)
        # Find all contours including internal ones
        cnts, hierarchy = cv2.findContours(closed, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        if hierarchy is not None:
            for i, c in enumerate(cnts):
                # If it has a parent, it's a hole. Fill it.
                if hierarchy[0][i][3] != -1:
                    cv2.drawContours(closed, [c], 0, 255, -1)
        
        # 3. Final Boundary Smoothing
        # A subtle blur + threshold prevents jagged edges from inflating "irregularity"
        smoothed = cv2.GaussianBlur(closed, (5, 5), 0)
        _, final_mask = cv2.threshold(smoothed, 127, 255, cv2.THRESH_BINARY)

        return final_mask

    def _extract_largest_region(self, binary: np.ndarray) -> np.ndarray:
        """
        Assumption:
        - Prostate gland is the largest connected foreground region.
        """

        contours, _ = cv2.findContours(
            binary,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE,
        )

        if len(contours) == 0:
            return np.zeros_like(binary, dtype=np.uint8)

        largest_contour = max(contours, key=cv2.contourArea)

        mask = np.zeros_like(binary, dtype=np.uint8)
        cv2.drawContours(
            mask,
            [largest_contour],
            contourIdx=-1,
            color=255,
            thickness=-1,
        )

        return mask
