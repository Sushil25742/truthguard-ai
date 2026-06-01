# TruthGuard AI

A production-ready full-stack AI platform designed to detect whether a news article or text is Fake or Real using a DistilBERT-based NLP model.

## Features

- **Prediction**: Fake / Real / Uncertain
- **Confidence Score**: Provided by DistilBERT model
- **Explanation**: Extraction of suspicious keywords/phrases
- **Source Credibility**: Warning if URL is provided
- **Anonymous Usage**: No login required. Usage tracked via IP limits.
- **Admin Dashboard**: Securely view overall usage metrics.

## Folder Structure

- `apps/web/`: Next.js 14 Application (React, Tailwind, Shadcn UI)
- `apps/api/`: FastAPI Application (Python, PyTorch, SQLAlchemy)
- `ml/`: Model Training & Evaluation scripts

---

## 🚀 Getting Started

### 1. How to Clone
```bash
git clone https://github.com/your-username/truthguard-ai.git
cd truthguard-ai
```

### 2. How to Set Environment Variables
Copy the `.env.example` file in both the frontend and backend to set up your local environment configuration:
```bash
# Backend Environment
cp apps/api/.env.example apps/api/.env

# Frontend Environment (if needed)
# cp apps/web/.env.example apps/web/.env.local
```

### 3. How to Install & Run Backend (FastAPI + SQLite)
The backend uses Python 3.13+ and a local SQLite database for MVP.

```bash
cd apps/api

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```

### 4. How to Install & Run Frontend (Next.js)
The frontend uses Node.js (v20+ recommended).

```bash
cd apps/web

# Install dependencies
npm install

# Start the development server (runs on http://localhost:3000)
npm run dev
```

---

## 🧠 Machine Learning

### How to Train the Model
The `ml/` folder contains Jupyter notebooks and scripts for fine-tuning the DistilBERT model.

```bash
cd ml
pip install -r requirements.txt
python scripts/train.py --dataset path/to/dataset.csv --epochs 3
```

---

## 🧪 Testing

### How to Test
You can run automated tests for both the frontend and backend. 

**Backend Tests:**
```bash
cd apps/api
source venv/bin/activate
pip install -r requirements-test.txt
export PYTHONPATH=.
pytest
```

**Frontend Tests:**
```bash
cd apps/web
npm run lint
npm run typecheck
npm run test
```

---

## 🚢 Deployment

### How to Deploy

**Frontend (Vercel)**
1. Connect your GitHub repository to Vercel.
2. Select the `apps/web` Root Directory.
3. Add environment variables (e.g., `NEXT_PUBLIC_API_URL` pointing to your deployed backend).
4. Deploy!

**Backend (Render)**
1. Connect your GitHub repository to Render (Web Service).
2. Set Build Command: `pip install -r apps/api/requirements.txt`
3. Set Start Command: `cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Deploy!
