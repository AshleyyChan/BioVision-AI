"""
validators.py
-------------
Centralized validation utilities for the BioVision backend.
"""

import os
import numpy as np
from typing import List, Dict, Any

from app.core.config import ALLOWED_IMAGE_EXTENSIONS


# ---------------------------------------------------------------------
# ID VALIDATION
# ---------------------------------------------------------------------

def validate_id(value: str, name: str) -> None:
    """
    Validate required identifiers like studyId, specimenId, dayId.
    """
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must be a non-empty string.")


# ---------------------------------------------------------------------
# IMAGE VALIDATION
# ---------------------------------------------------------------------

def validate_image_array(image: np.ndarray) -> None:
    """
    Validate image array loaded into memory.
    """
    if image is None:
        raise ValueError("Image is empty or failed to load.")

    if not isinstance(image, np.ndarray):
        raise ValueError("Image must be a NumPy array.")

    if image.size == 0:
        raise ValueError("Empty image array.")

    if image.ndim not in (2, 3):
        raise ValueError("Image must be grayscale or RGB.")

    h, w = image.shape[:2]
    if h < 64 or w < 64:
        raise ValueError("Image resolution too small for analysis.")


def validate_mask(mask: np.ndarray, image: np.ndarray) -> None:
    """
    Ensure segmentation mask is compatible with image.
    """
    if mask is None:
        raise ValueError("Segmentation mask is missing.")

    if not isinstance(mask, np.ndarray):
        raise ValueError("Segmentation mask must be a NumPy array.")

    if mask.shape[:2] != image.shape[:2]:
        raise ValueError("Mask dimensions must match image dimensions.")

    # Normalize mask (0/1 → 0/255)
    if mask.max() == 1:
        mask = mask * 255

    if np.count_nonzero(mask) == 0:
        raise ValueError("Segmentation mask contains no foreground.")


# ---------------------------------------------------------------------
# FILE VALIDATION
# ---------------------------------------------------------------------

def validate_image_file(filename: str) -> None:
    """
    Validate uploaded file type using filename only.
    SAFE: does not touch file stream.
    """
    if not filename or not isinstance(filename, str):
        raise ValueError("No filename provided.")

    # Defensive guard (prevents 500 crashes)
    if not ALLOWED_IMAGE_EXTENSIONS or not isinstance(ALLOWED_IMAGE_EXTENSIONS, (set, list, tuple)):
        raise ValueError("Allowed image extensions are not configured correctly.")

    ext = os.path.splitext(filename)[1].lower()

    if not ext:
        raise ValueError("Uploaded file has no extension.")

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError(
            f"Unsupported image format: {ext}. "
            f"Allowed formats: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"
        )


# ---------------------------------------------------------------------
# ANALYSIS REQUEST VALIDATION
# ---------------------------------------------------------------------

def validate_day_analysis_request(
    study_id: str,
    specimen_id: str,
    day_id: str,
) -> None:
    validate_id(study_id, "studyId")
    validate_id(specimen_id, "specimenId")
    validate_id(day_id, "dayId")


def validate_multi_day_request(
    study_id: str,
    specimen_id: str,
    day_ids: List[str],
) -> None:
    validate_id(study_id, "studyId")
    validate_id(specimen_id, "specimenId")

    if not isinstance(day_ids, list):
        raise ValueError("dayIds must be a list.")

    if len(day_ids) < 2:
        raise ValueError(
            "At least two days are required for longitudinal analysis."
        )

    for day_id in day_ids:
        validate_id(day_id, "dayId")


# ---------------------------------------------------------------------
# NUMERIC SAFETY
# ---------------------------------------------------------------------

def validate_numeric(value: Any, name: str) -> None:
    """
    Ensure numeric values are safe for computation.
    """
    if value is None:
        raise ValueError(f"{name} is missing.")

    if not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be numeric.")

    if np.isnan(value) or np.isinf(value):
        raise ValueError(f"{name} must be finite.")


# ---------------------------------------------------------------------
# RESULTS VALIDATION
# ---------------------------------------------------------------------

def validate_metrics(metrics: Dict[str, Any]) -> None:
    """
    Ensure extracted metrics are valid.
    """
    if not isinstance(metrics, dict):
        raise ValueError("Metrics must be a dictionary.")

    for key, value in metrics.items():
        validate_numeric(value, key)
