"""
health.py
---------
Health check endpoint.

Used for:
- Verifying backend is running
- CI/CD readiness checks
- Frontend startup validation
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("/")
def health_check():
    """
    Basic health check endpoint.

    Returns:
    - service status
    - timestamp
    """
    return {
        "status": "ok",
        "service": "biovision-backend",
        "timestamp": datetime.utcnow().isoformat()
    }
