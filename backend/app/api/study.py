"""
study.py
--------
API routes for Study management.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

from app.services.study_service import StudyService

router = APIRouter(prefix="/api/studies", tags=["Studies"])
study_service = StudyService()

# ==================================================
# Request Models (FRONTEND → BACKEND)
# ==================================================

class CreateStudyRequest(BaseModel):
    title: str = Field(..., min_length=1)
    researcherName: str = Field(..., min_length=1)
    date: str = Field(..., description="YYYY-MM-DD")
    time: str = Field(..., description="HH:MM")


# ==================================================
# Response Models (BACKEND → FRONTEND)
# ==================================================

class StudyResponse(BaseModel):
    study_id: str
    title: str
    researcherName: str
    date: str
    time: str
    created_at: str
    updated_at: str


# ==================================================
# Routes
# ==================================================

@router.post("", response_model=StudyResponse)
@router.post("/", response_model=StudyResponse, include_in_schema=False)
def create_study(payload: CreateStudyRequest):
    title = payload.title.strip()
    researcher = payload.researcherName.strip()

    if not title:
        raise HTTPException(status_code=400, detail="Study title is required")
    if not researcher:
        raise HTTPException(status_code=400, detail="Researcher name is required")

    return study_service.create_study(
        title=title,
        researcher_name=researcher,
        date=payload.date,
        time=payload.time,
    )


@router.get("", response_model=List[StudyResponse])
@router.get("/", response_model=List[StudyResponse], include_in_schema=False)
def list_studies():
    return study_service.list_studies()


@router.get("/{study_id}", response_model=StudyResponse)
def get_study(study_id: str):
    try:
        return study_service.get_study(study_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Study not found")


@router.put("/{study_id}", response_model=StudyResponse)
def update_study(study_id: str, payload: CreateStudyRequest):
    try:
        return study_service.update_study(
            study_id,
            {
                "title": payload.title.strip(),
                "researcherName": payload.researcherName.strip(),
                "date": payload.date,
                "time": payload.time,
            },
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Study not found")


@router.delete("/{study_id}", status_code=204)
def delete_study(study_id: str):
    try:
        study_service.delete_study(study_id)
        return None  # ✅ REQUIRED for 204
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Study not found")
