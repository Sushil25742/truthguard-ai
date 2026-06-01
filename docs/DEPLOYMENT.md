# TruthGuard AI - Free Tier Deployment Guide

This guide covers how to deploy the TruthGuard AI platform entirely on free-tier cloud providers. It is designed to be beginner-friendly.

---

## 1. Database Setup (Supabase or Neon)

Since TruthGuard AI uses SQLAlchemy, you can use any PostgreSQL provider. For free tiers, **Supabase** or **Neon** are highly recommended.

1. Create a free account on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
2. Create a new Project / Database.
3. Once the database is provisioned, locate the **Connection String** (URI). It should look like `postgresql://user:password@host:port/dbname`.
4. Save this URI; you will need it for the Backend deployment.
5. *Note: TruthGuard AI automatically creates the database tables on startup (via SQLAlchemy `create_all`). No manual migrations or seeding are required for the MVP.*

---

## 2. Backend Deployment (Render)

We will deploy the FastAPI backend to [Render's](https://render.com) free tier Web Service.

1. Sign up for Render and connect your GitHub account.
2. Click **New +** and select **Web Service**.
3. Choose your TruthGuard AI repository.
4. Fill in the following details:
   - **Root Directory**: `apps/api` (Leave blank if you prefer, but it's cleaner to specify. If left blank, you must adjust the commands below).
   - **Environment**: Python 3
   - **Build Command**: `pip install -r apps/api/requirements.txt` (or just `pip install -r requirements.txt` if Root Directory is `apps/api`).
   - **Start Command**: `cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port $PORT` (or `uvicorn app.main:app --host 0.0.0.0 --port $PORT` if Root Directory is set).
5. **Environment Variables**:
   Add the following under the Advanced section:
   - `DATABASE_URL`: Your Supabase/Neon connection string (ensure it uses `postgresql://`).
   - `ADMIN_API_KEY`: A secure random string used to protect your admin routes.
   - `FRONTEND_URL`: (You will set this to your Vercel URL later).
   - `USE_MOCK_MODEL`: `true` (Highly recommended for the free tier due to RAM limits).
   - `ENVIRONMENT`: `production`
6. **Health Check Path**: `/health`
7. Click **Create Web Service**. 

---

## 3. Frontend Deployment (Vercel)

We will deploy the Next.js frontend to [Vercel's](https://vercel.com) free Hobby tier.

1. Sign up for Vercel and connect your GitHub account.
2. Click **Add New... > Project**.
3. Import your TruthGuard AI repository.
4. **Configure Project**:
   - **Framework Preset**: Next.js (should be auto-detected).
   - **Root Directory**: Select `apps/web`.
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g., `https://truthguard-api.onrender.com`).
6. Click **Deploy**.

*After Vercel finishes deploying, copy your new Vercel URL and update the `FRONTEND_URL` environment variable back in your Render dashboard, then trigger a manual redeploy on Render.*

---

## 4. ML Model (Google Colab)

The free tier of Render has 512MB of RAM, which is often too small to load a full DistilBERT model into memory alongside FastAPI. 

**For MVP/Demo**: 
We recommend setting `USE_MOCK_MODEL=true` in Render. This allows the backend to simulate NLP predictions instantly without running out of RAM.

**For Real Inference**:
1. Open the notebooks in the `ml/` folder using [Google Colab](https://colab.research.google.com/).
2. Connect to a free T4 GPU runtime.
3. Train your model using the provided datasets.
4. Download the exported model weights.
5. To deploy the real model, you will likely need to upgrade your backend hosting (e.g., Render Starter tier for $7/mo) to accommodate the ~1GB+ RAM requirement of PyTorch + DistilBERT. Once upgraded, set `USE_MOCK_MODEL=false` and upload the model via Docker or cloud storage.

---

## 5. Free-Tier Limitations

Please be aware of the following when using free tiers:
- **Sleep / Cold Starts**: Render spins down free web services after 15 minutes of inactivity. The first request after a period of inactivity may take 30-50 seconds to respond while the server wakes up.
- **Memory Limits**: The 512MB RAM limit on Render is the primary reason large BERT models cannot be run in the cloud for free. Use the mock model for demos.
- **Database Limits**: Supabase and Neon free tiers pause after 1 week of inactivity.

---

## 6. Production Launch Checklist

- [ ] Change `ADMIN_API_KEY` to a strong, secret value.
- [ ] Ensure `FRONTEND_URL` on Render exactly matches your Vercel domain (no trailing slashes).
- [ ] Verify CORS is working (try submitting a prediction from Vercel).
- [ ] Verify the `/health` endpoint returns `200 OK`.
- [ ] Test the Admin Dashboard using your API Key.

---

## 7. Rollback Plan

If a deployment breaks production:
1. **Frontend (Vercel)**: Go to your Vercel project > **Deployments**. Click the three dots next to the last working deployment and select **Promote to Production** (Instant Rollback).
2. **Backend (Render)**: Go to your Render Web Service > **Events**. Find the last successful deploy and click **Rollback to this deploy**.
3. **Database**: If a database schema change caused the issue, you will need to manually reverse the change or restore a backup via the Supabase/Neon dashboard.

---

## 8. Common Errors and Fixes

- **Error**: `CORS Policy: No 'Access-Control-Allow-Origin' header is present.`
  - **Fix**: Ensure your `FRONTEND_URL` in Render matches your Vercel URL *exactly* (e.g., `https://my-app.vercel.app`), without a trailing slash.
- **Error**: `sqlalchemy.exc.OperationalError: Connection refused`
  - **Fix**: Double-check your `DATABASE_URL`. Ensure you have allowed all IPs (0.0.0.0/0) in your database provider's network settings if required.
- **Error**: Backend crashes with `MemoryError` or Exit Code `137`.
  - **Fix**: Render ran out of RAM. Ensure `USE_MOCK_MODEL=true` is set to avoid loading PyTorch.
