"""
analyze.py
----------
API routes for prostate gland analysis.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from app.services.day_analysis import DayAnalysisService
from app.services.multi_day_analysis import MultiDayAnalysisService

router = APIRouter(prefix="/api/analyze", tags=["Analysis"])

day_service = DayAnalysisService()
multi_day_service = MultiDayAnalysisService()

# -------------------------------------------------------------------
# Request Models
# -------------------------------------------------------------------

class DayAnalysisRequest(BaseModel):
    """
    Request for single-day analysis.
    """
    imagePath: str = Field(..., min_length=1)


class MultiDayResult(BaseModel):
    """
    ONE normalized day result sent from frontend.
    """
    day: str
    day_number: float = 0.0 # Numerical time axis
    area: float
    length: float
    breadth: float
    solidity: float
    mean_intensity: float
    shape_irregularity: float


class MultiDayAnalysisRequest(BaseModel):
    """
    Multi-day analysis request.

    Frontend sends ≥ 2 normalized day results.
    """
    days: List[MultiDayResult] = Field(..., min_items=2)


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@router.post("/day")
def analyze_day(payload: DayAnalysisRequest):
    """
    Run single-day prostate gland analysis.
    """
    try:
        # Resolve public URL to local filesystem path
        # payload.imagePath like: "/uploads/studies/..."
        # Local path: UPLOAD_DIR / "studies/..."
        
        raw_path = payload.imagePath.strip()
        print(f"analyze_day received path: '{raw_path}'") # DEBUG LOG

        # Handle full URLs (e.g. http://localhost:8000/uploads/...)
        if "://" in raw_path:
            try:
                # Split by /uploads/ to get the relative path
                # Example: http://localhost:8000/uploads/studies/... -> studies/...
                if "/uploads/" in raw_path:
                    _, rel_path = raw_path.split("/uploads/", 1)
                    from app.core.config import UPLOAD_DIR
                    local_path = UPLOAD_DIR / rel_path
                else:
                    # Fallback if no /uploads/ segment found
                    local_path = raw_path
            except ValueError:
                 local_path = raw_path
        
        elif raw_path.startswith("/uploads/"):
             # Remove /uploads/ prefix
             rel_path = raw_path[len("/uploads/"):]
             # Construct absolute path using UPLOAD_DIR from config
             from app.core.config import UPLOAD_DIR
             local_path = UPLOAD_DIR / rel_path
        else:
             # Fallback for absolute paths or other formats
             local_path = raw_path

        print(f"analyze_day resolved to local path: '{local_path}'") # DEBUG LOG

        analysis = day_service.analyze(local_path)
        return {"analysis": analysis}

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Image not found: {e}",
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image or parameters: {e}",
        )

    except Exception as e:
        import traceback
        traceback.print_exc() # 🔍 Print full stack trace to backend console
        raise HTTPException(
            status_code=500,
            detail=f"Internal error during day analysis: {e}",
        )


@router.post("/multi-day")
def analyze_multi_day(payload: MultiDayAnalysisRequest):
    """
    Run longitudinal multi-day analysis.

    Design:
    - Frontend sends normalized numeric metrics
    - Backend performs pure trend analysis
    - No filesystem writes
    """
    try:
        # Convert Pydantic models to plain dicts
        normalized_days = [d.dict() for d in payload.days]

        results = multi_day_service.analyze(normalized_days)

        return {"results": results}

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Internal error during multi-day analysis",
        )
