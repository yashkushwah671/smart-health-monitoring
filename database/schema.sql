-- ============================================================================
-- Smart Community Health Monitoring and Early Warning System (Northeast India)
-- Database Schema (MySQL 8.0+)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS smart_health_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_health_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    state VARCHAR(100) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    district_code VARCHAR(20) NOT NULL UNIQUE,
    total_population INT DEFAULT 0,
    primary_river_basin VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(30),
    role_id BIGINT NOT NULL,
    state VARCHAR(100) DEFAULT 'Assam',
    district_id BIGINT NULL,
    sub_centre VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_users_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Villages Table
CREATE TABLE IF NOT EXISTS villages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    district_id BIGINT NOT NULL,
    village_name VARCHAR(150) NOT NULL,
    village_code VARCHAR(50) NOT NULL UNIQUE,
    sub_centre VARCHAR(150),
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    estimated_population INT NOT NULL DEFAULT 500,
    primary_water_source VARCHAR(100) DEFAULT 'Tube Well / Hand Pump',
    sanitation_coverage_pct DECIMAL(5, 2) DEFAULT 60.0,
    flood_vulnerability_index VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, VERY_HIGH
    contact_asha_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_villages_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    CONSTRAINT fk_villages_asha FOREIGN KEY (contact_asha_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Field Observations Table
CREATE TABLE IF NOT EXISTS observations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    village_id BIGINT NOT NULL,
    recorded_by_user_id BIGINT NOT NULL,
    observation_date DATE NOT NULL,
    rainfall_mm DECIMAL(7, 2) NOT NULL DEFAULT 0.0,
    water_source_type VARCHAR(100) NOT NULL,
    turbidity_ntu DECIMAL(6, 2) NOT NULL,
    ph_level DECIMAL(4, 2) NOT NULL,
    e_coli_detected BOOLEAN DEFAULT FALSE,
    residual_chlorine_ppm DECIMAL(5, 2) DEFAULT 0.0,
    chlorination_done BOOLEAN DEFAULT FALSE,
    latrine_coverage_pct DECIMAL(5, 2) DEFAULT 65.0,
    open_drainage_flag BOOLEAN DEFAULT FALSE,
    reported_diarrhea_cases INT NOT NULL DEFAULT 0,
    reported_cholera_suspects INT NOT NULL DEFAULT 0,
    reported_typhoid_suspects INT NOT NULL DEFAULT 0,
    total_gastro_cases INT NOT NULL DEFAULT 0,
    notes TEXT,
    submission_channel VARCHAR(30) DEFAULT 'ONLINE_WEB', -- ONLINE_WEB, OFFLINE_SYNC, CSV_BULK
    sync_status VARCHAR(30) DEFAULT 'SYNCED',           -- PENDING, SYNCED, CONFLICT_RESOLVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_obs_village FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
    CONSTRAINT fk_obs_user FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. AI/ML Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    observation_id BIGINT NOT NULL,
    village_id BIGINT NOT NULL,
    risk_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    risk_category VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH
    confidence_pct DECIMAL(5, 2) NOT NULL DEFAULT 85.0,
    model_version VARCHAR(50) NOT NULL DEFAULT 'v1.2-ensemble-rf-xgb',
    model_type VARCHAR(50) DEFAULT 'HYBRID_ML_EPIDEMIOLOGICAL',
    rainfall_factor_pct DECIMAL(5, 2) DEFAULT 0.0,
    water_quality_factor_pct DECIMAL(5, 2) DEFAULT 0.0,
    case_trend_factor_pct DECIMAL(5, 2) DEFAULT 0.0,
    sanitation_factor_pct DECIMAL(5, 2) DEFAULT 0.0,
    summary_recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_obs FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE CASCADE,
    CONSTRAINT fk_pred_village FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Prediction Explainability Details
CREATE TABLE IF NOT EXISTS prediction_explanations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prediction_id BIGINT NOT NULL,
    factor_key VARCHAR(100) NOT NULL,
    factor_name VARCHAR(150) NOT NULL,
    factor_value VARCHAR(100),
    impact_direction VARCHAR(20) NOT NULL, -- INCREASES_RISK, NEUTRAL, DECREASES_RISK
    contribution_weight DECIMAL(6, 3) NOT NULL,
    explanation_text TEXT NOT NULL,
    CONSTRAINT fk_expl_pred FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Early-Warning Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prediction_id BIGINT NOT NULL,
    village_id BIGINT NOT NULL,
    alert_code VARCHAR(50) NOT NULL UNIQUE,
    alert_level VARCHAR(20) NOT NULL, -- MEDIUM_RISK_WARNING, HIGH_RISK_OUTBREAK_SURGE
    trigger_reason TEXT NOT NULL,
    recommended_actions TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW', -- NEW, REVIEWED, RESOLVED
    reviewed_by_user_id BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alert_pred FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_village FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_user FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. What-If Simulation Runs
CREATE TABLE IF NOT EXISTS simulation_runs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    village_id BIGINT NOT NULL,
    base_rainfall_mm DECIMAL(7, 2) NOT NULL,
    simulated_rainfall_mm DECIMAL(7, 2) NOT NULL,
    rainfall_delta_pct DECIMAL(5, 2) NOT NULL,
    base_risk_score DECIMAL(5, 2) NOT NULL,
    base_risk_category VARCHAR(20) NOT NULL,
    simulated_risk_score DECIMAL(5, 2) NOT NULL,
    simulated_risk_category VARCHAR(20) NOT NULL,
    delta_score DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sim_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sim_village FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Offline Sync Audit Logs
CREATE TABLE IF NOT EXISTS sync_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_sync_id VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    records_synced INT NOT NULL DEFAULT 0,
    conflicts_resolved INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sync_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for performance
CREATE INDEX idx_obs_village_date ON observations(village_id, observation_date);
CREATE INDEX idx_pred_created_at ON predictions(created_at);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_villages_coords ON villages(latitude, longitude);
