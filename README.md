# Pneumonia Detector: full-stack app

React (Vite) + FastAPI + Clerk login + **MySQL** history + Cloudinary image storage.

```
pneumonia-app/
├── notebooks/                  Colab notebook that trains the model
├── backend/
│   ├── ml_model/               trained model file goes here (pneumonia_model.keras)
│   ├── app/
│   │   ├── main.py             creates the FastAPI app
│   │   ├── core/
│   │   │   ├── config.py       all settings (reads .env)
│   │   │   └── security.py     Clerk login check
│   │   ├── db/
│   │   │   ├── database.py     MySQL connection
│   │   │   └── models.py       "predictions" table
│   │   ├── schemas/            Pydantic response models
│   │   ├── api/
│   │   │   ├── router.py
│   │   │   └── routes/         health, predict, history
│   │   ├── services/           image storage (Cloudinary / local)
│   │   └── ml/predictor.py     loads the model and predicts
│   ├── requirements.txt  Dockerfile  .env.example
├── frontend/
│   └── src/
│       ├── components/         Header, Footer, UploadCard, ResultCard, HistoryList
│       ├── pages/              LandingPage (signed out), Dashboard (signed in)
│       ├── services/api.js     calls to the backend
│       ├── styles/  config.js  main.jsx  App.jsx
└── docker-compose.yml          optional: MySQL + backend in one command
```

## How it works
1. User signs in with Clerk (frontend).
2. Frontend sends the X-ray + Clerk token to `POST /predict`.
3. Backend verifies the token, runs the model, uploads the image to Cloudinary, saves a row in the MySQL `predictions` table (with the Clerk `user_id`) and returns the result.
4. `GET /history` returns only that user's rows. `DELETE /history/{id}` removes a scan and its image.

The table is created automatically on first start. No manual SQL is needed.

## Step 1: Get your trained model
Run `notebooks/pneumonia_detection.ipynb` in Colab (GPU), then:
```python
from google.colab import files
files.download("pneumonia_model.keras")
```
Put the file at `backend/ml_model/pneumonia_model.keras`.

## Step 2: Create the free accounts
| Service | What you need |
|---|---|
| **Clerk** (clerk.com): create an app, enable Email / Google | **Publishable key** (`pk_test_...`) and **Frontend API URL** (API Keys page) |
| **MySQL**: [TiDB Cloud](https://tidbcloud.com) Serverless (free, MySQL compatible), [Aiven](https://aiven.io) or Railway | Host, user, password, database name |
| **Cloudinary** (cloudinary.com) | `CLOUDINARY_URL` (Dashboard → API Keys) |

For cloud MySQL that requires SSL (TiDB, Aiven), set `DB_SSL=true`.

## Step 3: Run locally
**MySQL** (pick one)
- Docker: `docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=pneumonia_db -p 3306:3306 mysql:8`
- or install MySQL yourself and run `CREATE DATABASE pneumonia_db;`

**Backend** (use Python 3.10 to 3.12; Python 3.12 is recommended)
```bash
cd backend
python -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```
On Windows PowerShell, select Python 3.12 explicitly (install it first if `py -0p` does not list it):
```powershell
cd backend
py -3.12 -m venv venv312
.\venv312\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload
```
Fill in `DATABASE_URL` and `CLERK_ISSUER` in `.env`.
Open http://localhost:8000/docs to see the API. With `CLOUDINARY_URL` empty, images are saved in `backend/uploads/`.

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local   # fill in VITE_CLERK_PUBLISHABLE_KEY
npm run dev                  # http://localhost:5173
```

**Or run MySQL + backend together:** `docker compose up --build` (needs the model file and `backend/.env`).

## Step 4: Deploy
**Backend → Render (or Railway / Fly.io / Hugging Face Spaces)**
1. Push the repo to GitHub (include `pneumonia_model.keras`; it is about 25 MB).
2. Render → New → Web Service → the repo → **Root Directory: `backend`**, Runtime: **Docker**.
3. Environment variables:
   - `DATABASE_URL` = `mysql+pymysql://USER:PASSWORD@HOST:PORT/DBNAME` (and `DB_SSL=true` if required)
   - `CLERK_ISSUER` = your Clerk Frontend API URL
   - `ALLOWED_ORIGINS` = your Vercel URL, e.g. `https://my-app.vercel.app` (no trailing slash)
   - `CLOUDINARY_URL` = Cloudinary URL
4. Check `https://YOUR-BACKEND/health` returns `{"status":"ok"}`.

**Frontend → Vercel**
1. New Project → the repo → **Root Directory: `frontend`**.
2. Environment variables: `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` (your Render URL).
3. Deploy, then put the final Vercel URL into `ALLOWED_ORIGINS` on Render.

## Notes
- **Free hosting sleeps**: the first request after idle can take about a minute (TensorFlow has to load). If the app runs out of memory, use a bigger plan or convert the model to TFLite/ONNX.
- **Never commit** `.env` files. The backend does not need Clerk's secret key; it only uses the public issuer URL to check tokens.
- **Clerk dev keys** (`pk_test_`) are fine for a demo or college project.
- **Privacy**: Cloudinary links are public but hard to guess. Fine for public dataset images; do not upload real patients' X-rays.
- **Threshold**: set `THRESHOLD=0.4` to catch more pneumonia cases at the cost of more false alarms.
- Educational project, not a medical device.
