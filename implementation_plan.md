# TruthGuard AI Implementation Blueprint

A production-ready full-stack AI platform designed to detect whether a news article or text is Fake or Real using a BERT-based NLP model.

## User Review Required
> [!IMPORTANT]
> Please review the proposed architecture below. Specifically, confirm if you prefer **DistilBERT** over standard BERT for faster inference in production, and if you are comfortable with using **Clerk** or **Supabase Auth** for identity management. The current plan outlines a decoupled architecture (Next.js Frontend + FastAPI Backend).

## Open Questions
- **Auth Provider:** Do you prefer Clerk, Supabase Auth, or a custom JWT implementation for user management?
- **Backend ORM:** For the Python FastAPI backend, is SQLAlchemy your preferred ORM, or would you like to explore Prisma-Python or SQLModel?
- **Scraping Strategy:** For the URL analysis feature, should we use a simple library like `BeautifulSoup` or a headless browser (e.g., Playwright) to bypass basic anti-bot protections?
- **Hosting Preferences:** The plan assumes Vercel for Frontend and Render/Railway for Backend. Do you have a strict preference?

---

## 1. Tech Stack Decisions

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend (API + ML):** FastAPI (Python), Uvicorn, Pydantic
- **AI/ML:** Python, PyTorch, Hugging Face Transformers (DistilBERT recommended for lower latency), SHAP/LIME for explainability
- **Database:** PostgreSQL (hosted on Supabase or Neon)
- **ORM:** SQLAlchemy (Backend data management)
- **Authentication:** Supabase Auth or Clerk (JWT validation in FastAPI)
- **Deployment:** Vercel (Frontend), Render / Railway / Fly.io (Backend via Docker)

---

## 2. Complete Folder Structure

```text
TruthGuard-AI/
├── frontend/                # Next.js 14 Application
│   ├── src/
│   │   ├── app/             # App router pages (dashboard, scan, admin)
│   │   ├── components/      # UI components (Shadcn UI, custom components)
│   │   ├── lib/             # Utilities, API client (Axios/Fetch wrappers)
│   │   ├── store/           # Global state (if needed, Zustand)
│   │   └── types/           # TypeScript interfaces
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # FastAPI Application
│   ├── app/
│   │   ├── api/             # API routers (v1)
│   │   ├── core/            # Configuration, security, auth middleware
│   │   ├── db/              # SQLAlchemy models & Alembic migrations
│   │   ├── ml/              # Model loading, inference pipeline, NLP utils
│   │   ├── schemas/         # Pydantic models (request/response validation)
│   │   └── services/        # Business logic (CRUD, scraping, analysis)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
├── ml_pipeline/             # Model Training & Evaluation
│   ├── data/                # Datasets (gitignored)
│   ├── notebooks/           # Jupyter notebooks for EDA and prototyping
│   ├── scripts/
│   │   ├── train.py         # Training script (Hugging Face Trainer)
│   │   ├── evaluate.py      # Model evaluation & metrics
│   │   └── export.py        # Export to optimized format (ONNX/TorchScript)
│   └── models/              # Saved model weights
├── .github/
│   └── workflows/           # CI/CD pipelines (Tests, Linting, Deployment)
├── docker-compose.yml       # Local development (DB, Backend, Redis)
└── README.md
```

---

## 3. API Route List (FastAPI)

- `POST /api/v1/analyze/text` - Submit text snippet for Fake/Real prediction.
- `POST /api/v1/analyze/url` - Submit URL (backend scrapes content, then predicts).
- `POST /api/v1/analyze/file` - Upload .txt or .csv for analysis.
- `GET /api/v1/history` - Retrieve a logged-in user's previous checks (paginated).
- `GET /api/v1/history/{id}` - Get detailed view of a specific check.
- `POST /api/v1/feedback` - User submits feedback on a prediction (accurate/inaccurate).
- `GET /api/v1/admin/stats` - Admin dashboard analytics (total scans, fake/real ratio).
- `GET /api/v1/admin/users` - Admin user management.
- `GET /api/v1/admin/flagged-urls` - List URLs frequently flagged as fake.

---

## 4. Database Schema (PostgreSQL)

**Users Table**
- `id` (UUID, PK)
- `email` (String, Unique)
- `role` (Enum: free, premium, admin)
- `api_usage_count` (Integer)
- `created_at` (Timestamp)

**ScanHistory Table**
- `id` (UUID, PK)
- `user_id` (UUID, FK -> Users.id, Nullable for anonymous scans)
- `input_type` (Enum: text, url, file)
- `source_url` (String, Nullable)
- `text_snippet` (Text)
- `prediction` (Enum: Fake, Real, Uncertain)
- `confidence_score` (Float)
- `flagged_keywords` (JSONB)
- `explanation` (Text)
- `created_at` (Timestamp)

**Feedback Table**
- `id` (UUID, PK)
- `scan_id` (UUID, FK -> ScanHistory.id)
- `user_id` (UUID, FK -> Users.id)
- `is_correct` (Boolean)
- `comments` (Text, Nullable)
- `created_at` (Timestamp)

---

## 5. UI Page List (Next.js)

- `/` - **Landing Page**: Hero section, Features, Pricing, Call to Action.
- `/scan` - **Scanner Interface**: Tabs for Text Input, URL Input, and File Upload.
- `/results/[id]` - **Result View**: Displays Confidence score gauge, AI explanation, highlighted suspicious keywords, and source credibility warning.
- `/dashboard` - **User Dashboard**: History of previous checks, recent activity, API usage stats.
- `/settings` - **Settings**: Manage profile, subscription tier, and API keys.
- `/admin` - **Admin Panel**: Overview stats, user table, feedback review, flagged sources.

---

## 6. ML Pipeline Design

1. **Dataset**: ISOT Fake News Dataset or similar Kaggle datasets (Real and Fake news).
2. **Preprocessing**: Tokenization, HTML/URL stripping, lowercasing.
3. **Model Selection**: `distilbert-base-uncased` (Provides ~95% of BERT's performance but is 60% faster and lighter, ideal for web APIs).
4. **Training**: Fine-tune classification head using Hugging Face `Trainer`.
5. **Interpretability**: Use Integrated Gradients or Attention-weight extraction to identify "suspicious keywords/phrases" to provide the explanation.
6. **Inference Optimization**: Export to ONNX format to reduce latency and memory footprint on the hosting provider. Loaded globally in FastAPI on startup.

---

## 7. Security Checklist

- [ ] **Input Validation:** Enforce strict length limits on text payloads to prevent DoS attacks. Sanitize HTML/JS to prevent XSS.
- [ ] **Authentication:** Verify JWTs on all protected endpoints using custom FastAPI dependency.
- [ ] **Rate Limiting:** Implement Redis-based rate limiting (e.g., 5 req/min for free, 50 req/min for premium).
- [ ] **CORS:** Restrict allowed origins to the Vercel frontend URL.
- [ ] **File Upload Security:** Validate MIME types (strictly `.txt`, `.csv`), limit file sizes (e.g., max 5MB).
- [ ] **Row-Level Access:** Ensure users can only query `ScanHistory` and `Feedback` linked to their own `user_id`. Admin endpoints restricted by role.
- [ ] **Prompt Injection Mitigation:** Model is extractive/classificatory, not generative, heavily mitigating traditional LLM prompt injection, but input length & format must still be constrained.

---

## 8. Deployment Checklist

- [ ] **Database Setup:** Provision Supabase/Neon PostgreSQL instance and run Alembic migrations.
- [ ] **Backend Hosting:** Create `Dockerfile`. Deploy FastAPI to Render/Railway. Set RAM limit to accommodate the ~500MB DistilBERT model.
- [ ] **Frontend Hosting:** Connect Next.js repository to Vercel. Configure `NEXT_PUBLIC_API_URL`.
- [ ] **Environment Variables:** Securely store DB credentials, JWT secrets, and API keys in deployment platforms.
- [ ] **CI/CD Pipeline:** GitHub Actions to run Pytest/Jest on Pull Requests. Auto-deploy to staging on merge.
- [ ] **Logging & Monitoring:** Integrate Sentry for error tracking and backend crash reports.

---

## 9. Development Milestone Plan

- **Milestone 1: Foundation (Days 1-3)**
  - Repository setup, Next.js & FastAPI initialization, DB Schema creation & migrations, Basic Authentication setup.
- **Milestone 2: ML Pipeline & Core API (Days 4-7)**
  - Model training/fine-tuning script, ONNX export, FastAPI inference endpoint integration, text preprocessing.
- **Milestone 3: Features & Integration (Days 8-12)**
  - Build URL scraping, file upload handling, history logging to DB, explainability (keyword highlighting) logic.
- **Milestone 4: Frontend Implementation (Days 13-17)**
  - UI development (Tailwind + Shadcn), Scan Interface, Results Visualization, User Dashboard.
- **Milestone 5: Admin Panel & Polish (Days 18-21)**
  - Admin dashboard, Rate limiting, Security audits, Vercel/Render deployment, End-to-end testing.
