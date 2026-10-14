# day.py
# ------
# API routes for DAY lifecycle within a Specimen.
# Thin HTTP layer over day_service.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

from app.services.day_service import (
    list_days,
    create_day,
    update_day,
    delete_day as delete_day_service,  # ✅ ALIAS
)

router = APIRouter(
    prefix="/api/studies/{study_id}/specimens/{specimen_id}/days",
    tags=["Days"],
)

# ------------------------------------------------------------------
# Request models
# ------------------------------------------------------------------

class CreateDayRequest(BaseModel):
    label: str = Field(..., min_length=1)
    concentration: Optional[str] = None
    level: Optional[str] = None
    unit: Optional[str] = "mM"
    temperature: Optional[str] = None
    treatmentType: Optional[str] = None
    treatment_type: Optional[str] = None


class UpdateDayRequest(BaseModel):
    label: Optional[str] = None
    concentration: Optional[str] = None
    level: Optional[str] = None
    unit: Optional[str] = None
    temperature: Optional[str] = None
    treatmentType: Optional[str] = None
    treatment_type: Optional[str] = None
    image_path: Optional[str] = None
    analysis: Optional[Dict] = None


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def normalize_day_payload(payload: Dict) -> Dict:
    normalized = payload.copy()

    if "treatmentType" in normalized:
        normalized["treatment_type"] = normalized.pop("treatmentType")

    return normalized


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------

@router.get("")
def get_days(study_id: str, specimen_id: str) -> List[Dict]:
    try:
        return list_days(study_id, specimen_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
def add_day(
    study_id: str,
    specimen_id: str,
    payload: CreateDayRequest,
) -> Dict:
    try:
        return create_day(
            study_id,
            specimen_id,
            normalize_day_payload(payload.dict(exclude_unset=True)),
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{day_id}")
def edit_day(
    study_id: str,
    specimen_id: str,
    day_id: str,
    payload: UpdateDayRequest,
) -> Dict:
    try:
        return update_day(
            study_id,
            specimen_id,
            day_id,
            normalize_day_payload(payload.dict(exclude_unset=True)),
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------
# DELETE Day (✅ FIXED)
# ------------------------------------------------------------------

@router.delete("/{day_id}")
def delete_day_route(
    study_id: str,
    specimen_id: str,
    day_id: str,
) -> Dict:
    try:
        delete_day_service(
            study_id=study_id,
            specimen_id=specimen_id,
            day_id=day_id,
        )
        return {"message": "Day successfully deleted"}
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
