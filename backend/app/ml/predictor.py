"""Loads the TensorFlow Lite model (from ml_model/) and predicts on one image.

TFLite is much smaller than full TensorFlow, so it fits on a free 512 MB server.
"""
import io
import threading

import numpy as np
from PIL import Image

from app.core.config import settings

IMG_SIZE = (224, 224)

_interpreter = None
_input_index = None
_output_index = None
_lock = threading.Lock()  # the interpreter is not thread-safe, so one prediction at a time


def _interpreter_class():
    try:
        from ai_edge_litert.interpreter import Interpreter  # small runtime, used on the server
    except ImportError:
        try:
            from tflite_runtime.interpreter import Interpreter  # older name of the same runtime
        except ImportError:
            import tensorflow as tf  # fallback for a PC that already has TensorFlow installed

            Interpreter = tf.lite.Interpreter
    return Interpreter


def load_model():
    """Loads the model once and reuses it."""
    global _interpreter, _input_index, _output_index
    if _interpreter is None:
        interpreter = _interpreter_class()(model_path=settings.ml_model_path)
        interpreter.allocate_tensors()
        _input_index = interpreter.get_input_details()[0]["index"]
        _output_index = interpreter.get_output_details()[0]["index"]
        _interpreter = interpreter
    return _interpreter


def predict(image_bytes: bytes) -> tuple[str, float, float]:
    """Returns (label, confidence_in_label, probability_of_pneumonia)."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE, Image.BILINEAR)
    arr = np.expand_dims(np.asarray(img, dtype="float32"), 0)

    with _lock:
        interpreter = load_model()
        interpreter.set_tensor(_input_index, arr)
        interpreter.invoke()
        p = float(interpreter.get_tensor(_output_index)[0][0])  # probability of PNEUMONIA

    t = settings.threshold
    if p > t:
        return "PNEUMONIA", 0.5 + 0.5 * (p - t) / (1 - t), p
    return "NORMAL", 0.5 + 0.5 * (t - p) / t, p