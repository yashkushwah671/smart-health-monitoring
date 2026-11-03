# Render Deployment Guide: Smart Community Health Monitoring & Early Warning System

This guide provides instructions to deploy the entire multi-service Smart Health application to [Render](https://render.com).

---

## 🏗️ Architecture on Render

The project consists of three services designed to run seamlessly on Render:

| Service | Type on Render | Tech Stack | Root / Dockerfile | Free Tier Cost |
| :--- | :--- | :--- | :--- | :--- |
| **`smart-health-ml`** | **Web Service** | Python 3.11, Flask, Gunicorn, Scikit-learn | `ml-service/Dockerfile` | Free (spins down after 15m) |
| **`smart-health-backend`** | **Web Service** | Java 17, Spring Boot 3.3.4, Hibernate 6 | `backend/Dockerfile` | Free (spins down after 15m) |
| **`smart-health-frontend`** | **Static Site** | React 18, Vite, Tailwind CSS | `frontend/dist` | **100% Free Forever** (CDN, No spin-down) |
| **Database** | Embedded / Managed | H2 (Default) or Render PostgreSQL / MySQL | In-memory / Cloud | Free |

---

## 🚀 Step 1: Push Changes to GitHub

Render pulls directly from your GitHub repository (`smart-health-monitoring`).
Save and push all the Render-ready configurations:

```bash
git add .
git commit -m "Configure project for Render deployment: Dockerfiles, memory tuning, and render.yaml blueprint"
git push origin main
```

---

## 🌟 Method 1: Automatic 1-Click Deployment (Render Blueprint)

A `render.yaml` Blueprint file is included at the repository root. This automates the creation and connection of all three services.

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub repository: `yashkushwah671/smart-health-monitoring`.
4. Render will parse `render.yaml` and display the 3 services:
   - `smart-health-ml`
   - `smart-health-backend`
   - `smart-health-frontend`
5. Click **Apply**.
6. Render will build and deploy all three services automatically!

---

## 🛠️ Method 2: Manual Dashboard Setup (Step-by-Step)

If you prefer to configure each service manually in the Render dashboard:

### 1. Deploy the ML Microservice (`smart-health-ml`)
1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your repository: `smart-health-monitoring`.
3. Set the following details:
   - **Name**: `smart-health-ml`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Root Directory**: `ml-service`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (or `./ml-service/Dockerfile` if Root Directory is left blank)
   - **Instance Type**: `Free`
4. Click **Create Web Service**.
5. Once deployed, note down its URL (e.g., `https://smart-health-ml.onrender.com`).

---

### 2. Deploy the Spring Boot Backend (`smart-health-backend`)
1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your repository: `smart-health-monitoring`.
3. Set the following details:
   - **Name**: `smart-health-backend`
   - **Region**: Oregon (same region as ML service)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `ML_SERVICE_URL`: `https://smart-health-ml.onrender.com` (use your actual ML service URL from step 1)
   - `JAVA_OPTS`: `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Xss512k`
   - *(Optional Database)*: If using Render PostgreSQL or Cloud MySQL, add:
     - `DB_URL`: `jdbc:postgresql://<host>:<port>/<db_name>` (or `jdbc:mysql://...`)
     - `DB_USER`: `<username>`
     - `DB_PASSWORD`: `<password>`
     *(If omitted, it automatically uses the built-in H2 database and auto-seeds initial data).*
5. Click **Create Web Service**.
6. Once deployed, note down its URL (e.g., `https://smart-health-backend.onrender.com`).
   - You can verify it by opening `https://smart-health-backend.onrender.com/swagger-ui.html` in your browser.

---

### 3. Deploy the React Frontend (`smart-health-frontend`)
1. In Render Dashboard, click **New +** > **Static Site** *(Important: Choose Static Site for free CDN hosting!)*.
2. Connect your repository: `smart-health-monitoring`.
3. Set the following details:
   - **Name**: `smart-health-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://smart-health-backend.onrender.com/api` (use your backend URL from step 2 + `/api`)
5. Under **Redirects/Rewrites** (in settings after creation):
   - Click **Add Rewrite**
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
   *(This ensures React Router works on page refreshes without 404 errors).*
6. Click **Create Static Site**.

---

## 🔑 Default Login Credentials

The application auto-seeds the following roles and credentials upon startup:

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **State Administrator** | `admin` | `password123` | Full administrative access, user creation, village & district management |
| **District Health Officer** | `dho_majuli` | `password123` | District surveillance, alert resolution, hotspot heatmaps |
| **ASHA Field Worker** | `asha_rani` | `password123` | Offline-first field data entry, syndrome logging, water testing |

---

## 💡 Important Render Free Tier Tips

1. **Cold Starts**: Render free Web Services spin down after 15 minutes of inactivity. When you visit the app after an idle period, the first request may take 30-50 seconds to boot up. The frontend (Static Site) never spins down and is always instant.
2. **Memory Limit**: Render free tier allocates 512 MB RAM per service. The backend Dockerfile has been tuned with `-XX:MaxRAMPercentage=75.0 -Xss512k` to stay safely within memory bounds.
3. **Database Persistence**: The default embedded H2 database resets if the free tier container reboots. To keep permanent data across restarts, either create a free Render PostgreSQL database or a free MySQL database on [Aiven.io](https://aiven.io) or [Clever Cloud](https://www.clever-cloud.com) and supply `DB_URL`, `DB_USER`, `DB_PASSWORD`.

