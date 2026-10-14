"""
preprocessing.py
----------------
Image preprocessing pipeline for microscopic prostate gland images.
"""

from pathlib import Path
from typing import Union

import cv2
import numpy as np

from app.core.config import IMAGE_SIZE


class ImagePreprocessor:
    """
    Centralized image preprocessing logic.
    Produces a normalized RGB image suitable for segmentation and analysis.
    """

    def __init__(
        self,
        target_size=IMAGE_SIZE,
        apply_clahe: bool = True,
        denoise: bool = True,
    ):
        self.target_size = target_size
        self.apply_clahe = apply_clahe
        self.denoise = denoise

    # --------------------------------------------------
    # PUBLIC API
    # --------------------------------------------------

    def preprocess(self, image_path: Union[str, Path]) -> np.ndarray:
        """
        Full preprocessing pipeline.

        Returns:
            np.ndarray: preprocessed RGB image
        """
        image_path = Path(image_path)

        image = self._load_image(image_path)
        image = self._resize(image)

        if self.denoise:
            image = self._denoise(image)

        if self.apply_clahe:
            image = self._apply_clahe_rgb(image)

        return image

    # --------------------------------------------------
    # INTERNAL STEPS
    # --------------------------------------------------

    def _load_image(self, image_path: Path) -> np.ndarray:
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        image = cv2.imread(str(image_path))
        if image is None:
            raise ValueError(f"Failed to load image: {image_path}")

        # Convert to RGB immediately
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    def _resize(self, image: np.ndarray) -> np.ndarray:
        return cv2.resize(
            image,
            self.target_size,
            interpolation=cv2.INTER_AREA,
        )

    def _denoise(self, image: np.ndarray) -> np.ndarray:
        return cv2.GaussianBlur(
            image,
            ksize=(5, 5),
            sigmaX=0,
        )

    def _apply_clahe_rgb(self, image: np.ndarray) -> np.ndarray:
        """
        Apply CLAHE only on luminance (L channel) to preserve color integrity.
        """
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(
            clipLimit=2.0,
            tileGridSize=(8, 8),
        )
        l = clahe.apply(l)

        lab = cv2.merge((l, a, b))
        return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
