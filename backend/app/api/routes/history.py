from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import current_user_id
from app.db.database import get_db
from app.db.models import Prediction
from app.schemas.prediction import DeleteOut, PredictionOut
from app.services import storage_service

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[PredictionOut])
def list_history(user_id: str = Depends(current_user_id), db: Session = Depends(get_db)):
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)  # users only ever see their own scans
        .order_by(Prediction.created_at.desc(), Prediction.id.desc())
        .limit(100)
        .all()
    )


@router.delete("/{prediction_id}", response_model=DeleteOut)
def delete_prediction(prediction_id: int, user_id: str = Depends(current_user_id), db: Session = Depends(get_db)):
    row = db.query(Prediction).filter(Prediction.id == prediction_id, Prediction.user_id == user_id).first()
    if not row:
        raise HTTPException(404, "Not found")
    storage_service.delete_image(row.image_id)
    db.delete(row)
    db.commit()
    return {"deleted": prediction_id}
