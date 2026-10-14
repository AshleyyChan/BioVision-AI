"""
metadata_service.py
-------------------
Shared helpers for metadata normalization and validation.

Purpose:
- Enforce required fields
- Generate IDs and timestamps
- Avoid schema duplication across services

❌ Does NOT define domain schemas
❌ Does NOT replace service-layer logic
❌ Does NOT assume frontend payload shapes
"""

from datetime import datetime
from typing import Dict, List
from uuid import uuid4


# ------------------------------------------------------------------
# COMMON HELPERS
# ------------------------------------------------------------------

def utc_now() -> str:
    """Return UTC ISO timestamp."""
    return datetime.utcnow().isoformat()


def new_id() -> str:
    """Generate a new UUID string."""
    return str(uuid4())


def require_fields(data: Dict, fields: List[str]) -> None:
    """
    Raise ValueError if required fields are missing or None.
    """
    missing = [f for f in fields if f not in data or data[f] is None]
    if missing:
        raise ValueError(
            f"Missing required fields: {', '.join(missing)}"
        )
