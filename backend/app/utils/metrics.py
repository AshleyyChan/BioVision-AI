import numpy as np
import cv2
from typing import Dict


# ---------------------------------------------------------------------
# INTERNAL HELPERS
# ---------------------------------------------------------------------

def _normalize_mask(mask: np.ndarray) -> np.ndarray:
    """
    Ensure mask is binary uint8 (0 or 255).
    """
    if mask.dtype != np.uint8:
        mask = mask.astype(np.uint8)

    if mask.max() == 1:
        mask = mask * 255

    return mask


def _largest_contour(mask: np.ndarray):
    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )
    if not contours:
        return None
    return max(contours, key=cv2.contourArea)


# ---------------------------------------------------------------------
# BASIC MORPHOLOGY
# ---------------------------------------------------------------------

def area(mask: np.ndarray) -> float:
    """
    Compute area of segmented region.
    """
    mask = _normalize_mask(mask)
    return float(np.sum(mask > 0))


def perimeter(mask: np.ndarray) -> float:
    """
    Compute perimeter of segmented region.
    """
    mask = _normalize_mask(mask)
    contour = _largest_contour(mask)

    if contour is None:
        return 0.0

    return float(cv2.arcLength(contour, True))


# ---------------------------------------------------------------------
# SHAPE DESCRIPTORS
# ---------------------------------------------------------------------

def circularity(mask: np.ndarray) -> float:
    """
    Circularity = 4π * Area / Perimeter²
    Ideal circle ≈ 1.0
    """
    a = area(mask)
    p = perimeter(mask)

    if p == 0:
        return 0.0

    return float((4 * np.pi * a) / (p ** 2))


def aspect_ratio(mask: np.ndarray) -> float:
    """
    Ratio of major axis to minor axis.
    """
    mask = _normalize_mask(mask)
    contour = _largest_contour(mask)

    if contour is None or len(contour) < 5:
        return 0.0

    rect = cv2.minAreaRect(contour)
    w, h = rect[1]

    if w == 0 or h == 0:
        return 0.0

    return float(max(w, h) / min(w, h))


def shape_irregularity(mask: np.ndarray) -> float:
    """
    Measures boundary irregularity.
    Higher = more stress / deformation.
    """
    circ = circularity(mask)
    if circ == 0:
        return 0.0
    return float(1.0 / circ)


# ---------------------------------------------------------------------
# INTENSITY METRICS
# ---------------------------------------------------------------------

def intensity_metrics(
    image: np.ndarray,
    mask: np.ndarray,
) -> Dict[str, float]:
    """
    Compute intensity statistics within the gland.
    """
    mask = _normalize_mask(mask)
    values = image[mask > 0]

    if values.size == 0:
        return {
            "mean_intensity": 0.0,
            "std_intensity": 0.0,
            "intensity_variation": 0.0,
        }

    mean = float(np.mean(values))
    std = float(np.std(values))

    return {
        "mean_intensity": mean,
        "std_intensity": std,
        "intensity_variation": float(std / (mean + 1e-6)),
    }


# ---------------------------------------------------------------------
# STRESS-RELATED METRICS
# ---------------------------------------------------------------------

def swelling_index(
    current_area: float,
    baseline_area: float,
) -> float:
    """
    Positive → swelling
    Negative → contraction
    """
    if baseline_area == 0:
        return 0.0
    return float((current_area - baseline_area) / baseline_area)


def stress_score(
    irregularity: float,
    area_change: float,
    intensity_variation: float,
) -> float:
    """
    Composite stress indicator.
    """
    return float(
        0.4 * irregularity
        + 0.4 * abs(area_change)
        + 0.2 * intensity_variation
    )


# ---------------------------------------------------------------------
# AGGREGATE METRICS
# ---------------------------------------------------------------------

def extract_all_metrics(
    image: np.ndarray,
    mask: np.ndarray,
) -> Dict[str, float]:
    """
    Extract all metrics for a single day.
    """
    return {
        "area": area(mask),
        "perimeter": perimeter(mask),
        "circularity": circularity(mask),
        "aspect_ratio": aspect_ratio(mask),
        "shape_irregularity": shape_irregularity(mask),
        **intensity_metrics(image, mask),
    }
