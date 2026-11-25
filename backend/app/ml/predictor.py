"""Loads the trained Keras model (from ml_model/) and predicts on one image."""
import io

import numpy as np
from PIL import Image

from app.core.config import settings

IMG_SIZE = (224, 224)
_model = None


def load_model():
    """Loads the model once and reuses it."""
    global _model
    if _model is None:
        import tensorflow as tf

        _model = tf.keras.models.load_model(settings.ml_model_path)
    return _model


def predict(image_bytes: bytes) -> tuple[str, float, float]:
    """Returns (label, confidence_in_label, probability_of_pneumonia)."""
    # Same steps as the training notebook: RGB, 224x224, raw 0-255 pixels.
    # (The model already contains the MobileNetV2 preprocessing layer.)
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE, Image.BILINEAR)
    arr = np.expand_dims(np.asarray(img, dtype="float32"), 0)

    p = float(load_model().predict(arr, verbose=0)[0][0])  # probability of PNEUMONIA
    if p > settings.threshold:
        return "PNEUMONIA", p, p
    return "NORMAL", 1 - p, p
