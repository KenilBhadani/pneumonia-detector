"""Pydantic schemas: the shape of data sent back to the frontend."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_serializer


class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # lets us return database rows directly

    id: int
    label: str
    confidence: float
    prob_pneumonia: float
    image_url: str
    filename: str | None = None
    created_at: datetime

    @field_serializer("created_at")
    def _as_utc_text(self, value: datetime) -> str:
        return value.isoformat() + "Z"


class DeleteOut(BaseModel):
    deleted: int
