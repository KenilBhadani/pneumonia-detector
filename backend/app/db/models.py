"""Database tables (SQLAlchemy)."""
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)      # Clerk user id
    label: Mapped[str] = mapped_column(String(20))                     # PNEUMONIA or NORMAL
    confidence: Mapped[float] = mapped_column(Float)                   # confidence in that label (0-1)
    prob_pneumonia: Mapped[float] = mapped_column(Float)               # raw model output (0-1)
    image_url: Mapped[str] = mapped_column(String(500))
    image_id: Mapped[str] = mapped_column(String(255))                 # needed to delete the image later
    filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # always saved as UTC, so the frontend can show it in the user's own time zone
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
