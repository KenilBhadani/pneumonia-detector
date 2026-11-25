# ml_model/

Put your trained model file here:

    ml_model/pneumonia_model.keras

Get it from the Colab notebook (`notebooks/pneumonia_detection.ipynb`):

```python
from google.colab import files
files.download("pneumonia_model.keras")
```

If you use another file name or folder, change `ML_MODEL_PATH` in `.env`.
