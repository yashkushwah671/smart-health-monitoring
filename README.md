# Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Python ML](https://img.shields.io/badge/Python%20ML-FastAPI%2FFlask-blue.svg)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet-GIS%20Mapping-green.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-Academic%20Project-purple.svg)]()

> **USP**: *"An explainable, rainfall-aware, GIS-based early-warning system that predicts community-level water-borne disease risk and helps health workers understand why an area is at risk."*

---

## 📌 Executive Summary & Academic Scope

In rural regions across Northeast India (Assam, Meghalaya, Tripura, Arunachal Pradesh, Mizoram), seasonal monsoon flooding, surface runoff, and compromised water infrastructure frequently trigger acute water-borne disease outbreaks (diarrhea, suspected cholera, typhoid).

This system provides a **decision-support and early-warning platform** for **ASHA/ANM grassroots health workers** and **District Health Officers (DHO)**. By correlating rainfall anomalies, water quality parameters (turbidity, pH, *E. coli* biomarkers, residual chlorine), sanitation coverage, and active syndromic clustering, the system classifies community-level disease risk into:
- 🟢 **Low Risk (< 35.0)**: Normal baseline parameters; routine weekly surveillance.
- 🟡 **Medium Risk (35.0 - 69.9)**: Moderate hazard; precautionary halogen tablet distribution.
- 🔴 **High Outbreak Risk (≥ 70.0)**: Critical contamination; triggers immediate boil-water notice, water source super-chlorination, and active fever surveillance.

> [!IMPORTANT]
> **Academic & Ethical Disclaimer**: This is an early-warning decision-support tool for community health risk stratification, **NOT a clinical or individual medical diagnostic system**.

---

## 🚀 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI/UX** | React 18 (Vite), Tailwind CSS, Lucide Icons, Recharts, Responsive Layout |
| **GIS Mapping** | Leaflet.js with OpenStreetMap, dynamic color-coded hazard markers & popups |
| **Backend Core** | Java 17/22, Spring Boot 3.3.x (Spring Web, Spring Data JPA, Spring Security, Bean Validation) |
| **Security & Auth** | Stateless JWT (`io.jsonwebtoken:jjwt`), BCrypt password hashing, Role-based route guards |
| **Machine Learning** | Python 3.14, Flask, Scikit-learn (Random Forest + Gradient Boosting Ensemble), Pandas, NumPy |
| **Explainable AI** | Feature Attribution Engine & Plain-English Public Health Action Advisories |
| **Database** | Dual-Mode: MySQL 8.0 (Production/Docker) + Embedded H2 (Instant Zero-Setup Academic Demo) |
| **API Standards** | SpringDoc OpenAPI 3.0 (Interactive Swagger UI at `/swagger-ui.html`) |
| **Containerization** | Docker, Docker Compose orchestration |

---

## 👥 Seeded Demo User Accounts

All demo accounts use the standard password: `password123`

| Role | Username | Full Name | Jurisdiction / District |
| :--- | :--- | :--- | :--- |
| **State Administrator** | `admin` | Dr. Bhaskar Sarma | State Surveillance Unit, Guwahati |
| **District Health Officer** | `dho_majuli` | Dr. Pranjal Saikia (DHO) | Majuli District, Assam |
| **District Health Officer** | `dho_khasi` | Dr. Badaplin Lyngdoh (DHO) | East Khasi Hills, Meghalaya |
| **ASHA Field Worker** | `asha_majuli_1` | Runumi Bora (ASHA) | Kamalabari Sub-Centre, Majuli |
| **ASHA Field Worker** | `asha_barpeta_1` | Anowara Begum (ASHA) | Howly Rural Sub-Centre, Barpeta |
| **ANM Health Worker** | `asha_khasi_1` | Phidalia Marwein (ANM) | Cherrapunji / Sohra CHC, Meghalaya |

---

## ⚡ Quick Start & Running Instructions

### Option 1: Running Locally (Recommended for Academic Presentation)

#### 1. Start the Python ML Service
```bash
cd ml-service
# Dependencies: Flask, scikit-learn, pandas, numpy, joblib
python train_baseline.py
python app.py
# Runs on http://localhost:5000
```

#### 2. Start the Spring Boot Backend
```bash
cd backend
# Runs on http://localhost:8080 (Uses embedded H2 with pre-seeded data by default)
mvn spring-boot:run
```
*API Documentation (Swagger UI):* `http://localhost:8080/swagger-ui.html`  
*H2 Database Console:* `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:smart_health_db`, user: `sa`, password: empty)

#### 3. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

### Option 2: Docker Compose Multi-Container Orchestration
```bash
# From workspace root
docker-compose up --build
```

---

## 🧩 Key Functional Modules

1. **Executive Surveillance Dashboard**:
   - Monitored village counter, risk breakdown donut chart, active alerts ticker.
   - 7-Day Monsoon Rainfall vs Risk Score correlation area charts via Recharts.
2. **Interactive Leaflet GIS Risk Map**:
   - Real-time geospatial risk mapping across rural Northeast Indian districts (Majuli, Barpeta, Dhemaji, East Khasi Hills, West Garo Hills, Dhalai, Papum Pare, Champhai).
   - Pulsating alert pins for villages in High Outbreak Surge.
3. **Field Data Collection & Offline Sync**:
   - Single-entry form with real-time validation (Turbidity NTU, pH, *E. coli* strip test, Residual chlorine ppm, syndromic diarrhea/cholera counts).
   - Offline queue saving drafts to `localStorage` and automatic sync upon internet reconnection.
4. **Bulk CSV Ingestion**:
   - Multi-village batch upload with validation error handling and downloadable template.
5. **Explainable AI (XAI) Inspector**:
   - Visual risk gauge (0-100), factor contribution waterfall, and plain-English recommendations for ASHA workers.
6. **Early-Warning Alerts Workflow**:
   - Automated de-duplicated alert triggers with status transitions (`NEW` &rarr; `REVIEWED` &rarr; `RESOLVED`) and field audit logging.
7. **What-If Rainfall Anomaly Simulation**:
   - Counterfactual sensitivity slider (+10%, +20%, +30%, +50%) to evaluate flood impact before storm events.
8. **Reports & 1-Click CSV Export**:
   - Multi-filter historical queries and direct CSV export.

---

## 📂 Project Monorepo Structure

```text
smart-community-health-monitoring/
├── backend/                  # Java Spring Boot 3.3.x Application
│   ├── src/main/java/com/smarthealth/
│   │   ├── config/           # Security, JWT Filter, CORS, OpenAPI, DataInitializer
│   │   ├── controller/       # REST Controllers (Auth, Dashboard, Observations, etc.)
│   │   ├── dto/              # Request & Response Data Transfer Objects
│   │   ├── model/            # JPA Entities (Village, Observation, Prediction, Alert)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   └── service/          # Business Logic & ML Client with Fallback Engine
│   ├── pom.xml
│   └── Dockerfile
├── ml-service/               # Python ML & Explainability Microservice
│   ├── app.py                # Flask REST API (/predict, /simulate, /health)
│   ├── model.py              # ML Predictor & Rule-Based Fallback
│   ├── explainer.py          # XAI Feature Attribution & Guidance Engine
│   ├── train_baseline.py     # Ensemble Model Training Pipeline
│   ├── synthetic_data_generator.py # Northeast India Hydrological Generator
│   ├── test_ml_service.py    # Unit Test Suite
│   └── Dockerfile
├── frontend/                 # React 18 SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, StatCard, RiskBadge, RiskGauge, AlertModal
│   │   ├── context/          # AuthContext with Offline Status & Sync Manager
│   │   ├── pages/            # Dashboard, GIS Map, Data Entry, CSV Upload, XAI, Simulation, Reports
│   │   └── services/         # Axios API Client & Offline Storage Queue
│   ├── package.json
│   └── vite.config.js
├── database/                 # Database Schema & Seed Scripts
│   ├── schema.sql            # MySQL 8.0 DDL
│   └── seed_data.sql         # Seed Dataset for Northeast India
├── docs/                     # Academic Documentation
│   ├── ARCHITECTURE.md       # Architecture & Mermaid ER Diagrams
│   └── ACADEMIC_DEFENSE_GUIDE.md # Viva Voce Questions & Answers
├── docker-compose.yml        # Docker Multi-Container Config
├── .env.example              # Environment Configuration Template
└── README.md                 # Master Project Documentation
```

---

## 🧪 Testing Verification & Commands

### Backend Maven Tests:
```bash
cd backend
mvn test
```

### Python ML Service Unit Tests:
```bash
cd ml-service
python test_ml_service.py
```

### Frontend Build Validation:
```bash
cd frontend
npm run build
```

---

## 📜 Academic Project Information

- **Title**: Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India
- **Focus Region**: Rural Northeast India (Assam, Meghalaya, Tripura, Arunachal Pradesh, Mizoram)
- **Primary Domain**: Public Health Surveillance Informatics, Environmental Hydrology, Explainable AI (XAI)
