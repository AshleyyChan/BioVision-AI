from pathlib import Path
from typing import Tuple, Union

import cv2
import numpy as np

from app.core.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------
# IMAGE LOADING
# ---------------------------------------------------------------------

def load_image(
    image_path: Union[str, Path],
    grayscale: bool = False,
) -> np.ndarray:
    """
    Load an image from disk.

    Args:
        image_path: Path to image file
        grayscale: Load as grayscale if True

    Returns:
        Image as numpy array
    """
    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    flag = cv2.IMREAD_GRAYSCALE if grayscale else cv2.IMREAD_COLOR
    image = cv2.imread(str(image_path), flag)

    if image is None:
        raise ValueError(f"Failed to load image: {image_path}")

    logger.info(f"Loaded image → {image_path}")

    return image


# ---------------------------------------------------------------------
# IMAGE SAVING
# ---------------------------------------------------------------------

def save_image(
    image: np.ndarray,
    output_path: Union[str, Path],
) -> None:
    """
    Save image to disk.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    success = cv2.imwrite(str(output_path), image)
    if not success:
        raise IOError(f"Failed to save image: {output_path}")

    logger.info(f"Saved image → {output_path}")


# ---------------------------------------------------------------------
# IMAGE CONVERSIONS
# ---------------------------------------------------------------------

def to_grayscale(image: np.ndarray) -> np.ndarray:
    """
    Convert BGR/RGB image to grayscale.
    """
    if image.ndim == 2:
        return image
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def to_rgb(image: np.ndarray) -> np.ndarray:
    """
    Ensure image is RGB.
    """
    if image.ndim == 2:
        return cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


# ---------------------------------------------------------------------
# IMAGE RESIZING
# ---------------------------------------------------------------------

def resize_image(
    image: np.ndarray,
    size: Tuple[int, int],
) -> np.ndarray:
    """
    Resize image to (width, height).
    """
    return cv2.resize(image, size, interpolation=cv2.INTER_AREA)


# ---------------------------------------------------------------------
# OVERLAY UTILITIES
# ---------------------------------------------------------------------

def overlay_mask(
    image: np.ndarray,
    mask: np.ndarray,
    alpha: float = 0.4,
    color: Tuple[int, int, int] = (255, 0, 0),
) -> np.ndarray:
    """
    Overlay a binary mask on an image.
    """
    overlay = image.copy()

    if mask.max() == 1:
        mask = mask * 255

    colored_mask = np.zeros_like(image)
    colored_mask[mask > 0] = color

    cv2.addWeighted(
        colored_mask,
        alpha,
        overlay,
        1 - alpha,
        0,
        overlay,
    )

    return overlay


# ---------------------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------------------

def validate_image(image: np.ndarray) -> None:
    """
    Validate basic image properties.
    """
    if not isinstance(image, np.ndarray):
        raise TypeError("Image must be a numpy array")

    if image.size == 0:
        raise ValueError("Empty image array")
