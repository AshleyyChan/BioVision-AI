"""
trend_analysis.py
-----------------
Pure numerical longitudinal analysis.

Responsibilities:
- Compute trends and variability from ordered feature vectors
- Return backend-usable numeric summaries ONLY

❌ No domain interpretation
❌ No UI-facing strings
❌ No assumptions about time axis
"""

import numpy as np
from typing import List, Dict


# ------------------------------------------------------------------
# CORE NUMERICAL ANALYSIS
# ------------------------------------------------------------------

def analyze_trends(features: List[Dict[str, float]]) -> Dict[str, float]:
    """
    Analyze trends across ordered feature sets.
    """

    if not isinstance(features, list) or len(features) < 2:
        raise ValueError(
            "At least two feature sets are required for trend analysis"
        )

    # ------------------------------------------------------------------
    # Extract numeric arrays
    # ------------------------------------------------------------------

    areas = np.array([f["area"] for f in features], dtype=float)
    lengths = np.array([f["length"] for f in features], dtype=float)
    breadths = np.array([f["breadth"] for f in features], dtype=float)
    intensities = np.array([f["mean_intensity"] for f in features], dtype=float)
    irregularities = np.array([f["shape_irregularity"] for f in features], dtype=float)
    solidities = np.array([f["solidity"] for f in features], dtype=float)

    # Use day_number as X axis; fall back to sequential index if day_number is missing or zero-varianced
    x = np.array([f.get("day_number", i) for i, f in enumerate(features)], dtype=float)
    
    # Ensure x is strictly increasing or has variance to avoid polyfit errors
    if len(np.unique(x)) < 2:
        x = np.arange(len(features), dtype=float)

    # ------------------------------------------------------------------
    # Linear trends & Variability (RMSE)
    # ------------------------------------------------------------------

    def get_trend(y_vals):
        coeffs = np.polyfit(x, y_vals, 1)
        slope = float(coeffs[0])
        pred = np.polyval(coeffs, x)
        rmse = float(np.sqrt(np.mean((y_vals - pred)**2)))
        return slope, rmse

    avg_area_change, area_rmse = get_trend(areas)
    length_change, length_rmse = get_trend(lengths)
    breadth_change, breadth_rmse = get_trend(breadths)
    intensity_variation, intensity_rmse = get_trend(intensities)
    shape_variation, shape_rmse = get_trend(irregularities)
    solidity_change, solidity_rmse = get_trend(solidities)

    # ------------------------------------------------------------------
    # Compact summary (numerical → semantic happens upstream)
    # ------------------------------------------------------------------

    return {
        "avg_area_change": avg_area_change,
        "area_rmse": area_rmse,
        "avg_length_change": length_change,
        "length_rmse": length_rmse,
        "avg_breadth_change": breadth_change,
        "breadth_rmse": breadth_rmse,
        "intensity_variation": intensity_variation,
        "intensity_rmse": intensity_rmse,
        "shape_variation": shape_variation,
        "shape_rmse": shape_rmse,
        "avg_solidity_change": solidity_change,
        "solidity_rmse": solidity_rmse,
    }
