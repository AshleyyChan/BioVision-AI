"""
multi_day_analysis.py
---------------------
Runs LONGITUDINAL (multi-day) prostate gland analysis.
"""

from typing import List, Dict, Any

from app.ml.trend_analysis import analyze_trends


class MultiDayAnalysisService:
    """
    Performs temporal analysis across multiple days
    using extracted single-day features.
    """

    # --------------------------------------------------
    # Public API
    # --------------------------------------------------

    def analyze(self, day_results: List[Dict[str, Any]]) -> Dict:
        """
        Perform longitudinal analysis across days.

        Expected input (canonical):
        [
          {
            "day": 1,
            "area": float,
            "mean_intensity": float,
            "shape_irregularity": float
          },
          ...
        ]
        """

        if not isinstance(day_results, list) or len(day_results) < 2:
            raise ValueError(
                "At least two valid day results are required for longitudinal analysis"
            )

        # --------------------------------------------------
        # Validate required fields (CANONICAL)
        # --------------------------------------------------

        required_fields = {
            "day",
            "day_number",
            "area",
            "length",
            "breadth",
            "solidity",
            "mean_intensity",
            "shape_irregularity",
        }

        normalized_days: List[Dict[str, float]] = []

        for idx, d in enumerate(day_results):
            if not isinstance(d, dict):
                raise ValueError(
                    f"Day result at index {idx} is not a dictionary"
                )

            missing = required_fields - d.keys()
            if missing:
                raise ValueError(
                    f"Missing fields in day result at index {idx}: "
                    f"{', '.join(sorted(missing))}"
                )

            normalized_days.append({
                "day": str(d["day"]),
                "day_number": float(d.get("day_number", 0)),
                "area": float(d["area"]),
                "length": float(d["length"]),
                "breadth": float(d["breadth"]),
                "solidity": float(d["solidity"]),
                "mean_intensity": float(d["mean_intensity"]),
                "shape_irregularity": float(d["shape_irregularity"]),
            })

        # --------------------------------------------------
        # Numerical & Semantic Interpretation
        # --------------------------------------------------

        # Core numerical trend analysis
        trend_results = analyze_trends(normalized_days)

        # Biological interpretation of transitions
        interpretation = self._interpret_trends(trend_results)

        # --------------------------------------------------
        # Output (backend canonical, frontend-safe)
        # --------------------------------------------------

        return {
            "status": "ok",
            "trendAnalysis": trend_results,
            "interpretation": interpretation,
            "series": {
                "area": [d["area"] for d in normalized_days],
                "length": [d["length"] for d in normalized_days],
                "breadth": [d["breadth"] for d in normalized_days],
                "solidity": [d["solidity"] for d in normalized_days],
                "mean_intensity": [
                    d["mean_intensity"] for d in normalized_days
                ],
                "shape_irregularity": [
                    d["shape_irregularity"] for d in normalized_days
                ],
            },
        }

    def _interpret_trends(self, trends: Dict[str, float]) -> Dict[str, Any]:
        """
        Exclusive source of Biological Truth for Earthworm Prostate.
        Uses longitudinal trends (Slope, RMSE) to determine health.
        """
        area_slope = trends.get("avg_area_change", 0)
        area_rmse = trends.get("area_rmse", 0)
        
        solidity_slope = trends.get("avg_solidity_change", 0)
        solidity_rmse = trends.get("solidity_rmse", 0)
        
        shape_slope = trends.get("shape_variation", 0)
        shape_rmse = trends.get("shape_rmse", 0)
        
        intensity_slope = trends.get("intensity_variation", 0)
        intensity_rmse = trends.get("intensity_rmse", 0)

        # 1. Stress & Inflammation Detection
        # Calculated from volumetric swelling and structural collapse (solidity loss).
        instability_score = (
            (shape_rmse * 120) +        # Shape volatility
            (solidity_rmse * 150) +     # Structural instability
            (intensity_rmse / 8) +      # Metabolic flux
            (area_rmse / 80)            # Growth erraticism
        )
        
        # Trend Shift (Rapid swelling or sudden distortion)
        # solidity_slope < 0 indicates tissue "loosening" or collapse
        trend_factor = (
            max(0, area_slope * 10) + 
            max(0, -solidity_slope * 30) +
            max(0, shape_slope * 40)
        )
        
        composite_stress = instability_score + trend_factor

        if composite_stress > 50:
            stress_level = "High"
            stress_color = "error"
        elif composite_stress > 20:
            stress_level = "Moderate"
            stress_color = "warning"
        else:
            stress_level = "Low"
            stress_color = "success"

        # 2. Biological Status & Morphology
        # solidity_slope > 0 + area_slope < 0 is a strong sign of RECOVERY (tightening up)
        if area_slope > 0.15 and solidity_slope < -0.01:
            status = "Pathological Swelling"
            status_color = "error"
            summary_prefix = "Significant volumetric expansion and structural collapse detected"
        elif area_slope < -0.05 and solidity_slope > 0.005:
            status = "Regenerative Triage"
            status_color = "success"
            summary_prefix = "Positive tissue recovery with structural tightening observed"
        elif instability_score > 35:
             status = "Degenerative Transformation"
             status_color = "warning"
             summary_prefix = "Pronounced boundary and structural instability observed"
        elif area_slope > 0.02:
            status = "Standard Maturation"
            status_color = "success"
            summary_prefix = "Stable growth and tissue maturation"
        else:
            status = "Normal / Intact (Stable)"
            status_color = "success"
            summary_prefix = "No abnormal longitudinal markers detected"

        # Check if a trained Machine Learning model is available
        from app.ml.model_loader import ModelLoader
        ml_model = ModelLoader.load_trend_model()
        if ml_model is not None:
            try:
                features_vector = [
                    trends.get("avg_area_change", 0.0),
                    trends.get("area_rmse", 0.0),
                    trends.get("avg_length_change", 0.0),
                    trends.get("length_rmse", 0.0),
                    trends.get("avg_breadth_change", 0.0),
                    trends.get("breadth_rmse", 0.0),
                    trends.get("intensity_variation", 0.0),
                    trends.get("intensity_rmse", 0.0),
                    trends.get("shape_variation", 0.0),
                    trends.get("shape_rmse", 0.0),
                    trends.get("avg_solidity_change", 0.0),
                    trends.get("solidity_rmse", 0.0),
                ]
                import pandas as pd
                df_vec = pd.DataFrame([features_vector], columns=[
                    "avg_area_change",
                    "area_rmse",
                    "avg_length_change",
                    "length_rmse",
                    "avg_breadth_change",
                    "breadth_rmse",
                    "intensity_variation",
                    "intensity_rmse",
                    "shape_variation",
                    "shape_rmse",
                    "avg_solidity_change",
                    "solidity_rmse",
                ])
                ml_pred = ml_model.predict(df_vec)[0]
                if ml_pred in [
                    "Pathological Swelling",
                    "Regenerative Triage",
                    "Degenerative Transformation",
                    "Standard Maturation",
                    "Normal / Intact (Stable)",
                ]:
                    status = ml_pred
                    if status == "Pathological Swelling":
                        status_color = "error"
                        summary_prefix = "ML Model detected significant volumetric expansion and structural collapse"
                    elif status == "Regenerative Triage":
                        status_color = "success"
                        summary_prefix = "ML Model detected positive tissue recovery with structural tightening"
                    elif status == "Degenerative Transformation":
                        status_color = "warning"
                        summary_prefix = "ML Model detected pronounced boundary and structural instability"
                    elif status == "Standard Maturation":
                        status_color = "success"
                        summary_prefix = "ML Model detected stable growth and tissue maturation"
                    else:
                        status_color = "success"
                        summary_prefix = "ML Model detected homeostatic stability"
            except Exception as e:
                print(f"ML trend model inference fallback to rule-based: {e}")

        # 3. Specific Indicators
        stability_desc = "Erratic" if shape_rmse > 0.1 else "Stable"
        tissue_desc = "Degrading" if solidity_slope < -0.01 else "Intact"

        return {
            "overall_change": status,
            "status_color": status_color,
            "stress_level": stress_level,
            "stress_score": round(composite_stress, 1),
            "stress_color": stress_color,
            "morphology_trend": f"{stability_desc} ({'Irregular' if shape_slope > 0.005 else 'Smoothing'})",
            "tissue_health": tissue_desc,
            "summary": f"{summary_prefix}. The specimen is currently classified as '{status}' with {stress_level.lower()} physiological stress."
        }
