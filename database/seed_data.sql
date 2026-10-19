-- ============================================================================
-- Seed Data: Smart Community Health Monitoring & Early Warning System
-- Focus Region: Rural Northeast India (Assam, Meghalaya, Tripura, Arunachal, Manipur, Mizoram)
-- ============================================================================

USE smart_health_db;

-- Disable Foreign Key checks for clean seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE sync_logs;
TRUNCATE TABLE simulation_runs;
TRUNCATE TABLE alerts;
TRUNCATE TABLE prediction_explanations;
TRUNCATE TABLE predictions;
TRUNCATE TABLE observations;
TRUNCATE TABLE villages;
TRUNCATE TABLE users;
TRUNCATE TABLE districts;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'State System Administrator with full oversight, user management, and system config'),
(2, 'ROLE_DISTRICT_OFFICER', 'District Health Officer (DHO) monitoring district surveillance, GIS risk map, and alerts'),
(3, 'ROLE_ASHA_WORKER', 'Accredited Social Health Activist (ASHA) / ANM field worker submitting village observations');

-- 2. Insert Districts
INSERT INTO districts (id, state, district_name, district_code, total_population, primary_river_basin) VALUES
(1, 'Assam', 'Majuli', 'AS-MJL', 167300, 'Brahmaputra Island Basin'),
(2, 'Assam', 'Barpeta', 'AS-BRP', 1693000, 'Manas / Brahmaputra Basin'),
(3, 'Assam', 'Dhemaji', 'AS-DHJ', 686133, 'Subansiri / Brahmaputra Basin'),
(4, 'Meghalaya', 'East Khasi Hills', 'ML-EKH', 825922, 'Umngot / Wah Umkhrah Basin'),
(5, 'Meghalaya', 'West Garo Hills', 'ML-WGH', 643291, 'Simsang / Jinjiram Basin'),
(6, 'Tripura', 'Dhalai', 'TR-DHL', 378230, 'Dhalai / Manu River Basin'),
(7, 'Arunachal Pradesh', 'Papum Pare', 'AR-PAP', 176573, 'Dikrong Basin'),
(8, 'Mizoram', 'Champhai', 'MZ-CMP', 125745, 'Tiau River Basin');

-- 3. Insert Demo Users
-- Passwords for all demo accounts: 'password123' (BCrypt hashed: $2a$10$7zV.k6Yg.uGsq4B8o1B27.U3sO9E8K0H5o7K1L2M3N4P5Q6R7S8Tu or standard Spring BCrypt)
INSERT INTO users (id, username, password_hash, full_name, email, phone, role_id, state, district_id, sub_centre, is_active) VALUES
(1, 'admin', '$2a$10$e8T7tG4H3gI1dJ0kL2mN4O6pQ8rS0tU2vW4xY6zA8bC0dE2fG4hI6', 'Dr. Bhaskar Sarma', 'admin.health@assam.gov.in', '+91 9435012345', 1, 'Assam', NULL, 'State Surveillance Unit, Guwahati', TRUE),
(2, 'dho_majuli', '$2a$10$e8T7tG4H3gI1dJ0kL2mN4O6pQ8rS0tU2vW4xY6zA8bC0dE2fG4hI6', 'Dr. Pranjal Saikia (DHO)', 'dho.majuli@assam.gov.in', '+91 9435123456', 2, 'Assam', 1, 'Garamur Civil Hospital HQ', TRUE),
(3, 'dho_khasi', '$2a$10$e8T7tG4H3gI1dJ0kL2mN4O6pQ8rS0tU2vW4xY6zA8bC0dE2fG4hI6', 'Dr. Badaplin Lyngdoh (DHO)', 'dho.khasi@meghalaya.gov.in', '+91 9436123456', 2, 'Meghalaya', 4, 'Shillong District Health Office', TRUE),
(4, 'asha_majuli_1', '$2a$10$e8T7tG4H3gI1dJ0kL2mN4O6pQ8rS0tU2vW4xY6zA8bC0dE2fG4hI6', 'Runumi Bora (ASHA)', 'runumi.asha@majuli.nhm.in', '+91 9854011223', 3, 'Assam', 1, 'Kamalabari Sub-Centre', TRUE),
(5, 'asha_barpeta_1', '$2a$10$e8T7tG4H3gI1dJ0kL2mN4O6pQ8rS0tU2vW4xY6zA8bC0dE2fG4hI6', 'Anowara Begum (ASHA)', 'anowara.asha@barpeta.nhm.in', '+91 9854022334', 3, 'Assam', 2, 'Howly Rural Sub-Centre', TRUE),
(6, 'asha_khasi_1', '$2a$10$e8T7tG4H3gI1dJ0kL2mN4O6pQ8rS0tU2vW4xY6zA8bC0dE2fG4hI6', 'Phidalia Marwein (ANM)', 'phidalia.anm@khasi.nhm.in', '+91 9854033445', 3, 'Meghalaya', 4, 'Cherrapunji / Sohra CHC', TRUE);

-- 4. Insert Villages across Northeast India
INSERT INTO villages (id, district_id, village_name, village_code, sub_centre, latitude, longitude, estimated_population, primary_water_source, sanitation_coverage_pct, flood_vulnerability_index, contact_asha_id) VALUES
-- Majuli Island (Assam)
(1, 1, 'Garamur Chariali', 'AS-MJL-001', 'Garamur Sub-Centre', 26.9632, 94.2185, 1850, 'Tube Well / Hand Pump', 68.0, 'HIGH', 4),
(2, 1, 'Kamalabari Ghat', 'AS-MJL-002', 'Kamalabari Sub-Centre', 26.9150, 94.1750, 2200, 'River / Shallow Borewell', 52.0, 'VERY_HIGH', 4),
(3, 1, 'Jengraimukh', 'AS-MJL-003', 'Jengraimukh Sub-Centre', 27.0421, 94.3312, 1420, 'Ring Well / Stream', 58.0, 'HIGH', 4),
(4, 1, 'Salmora Pottery Village', 'AS-MJL-004', 'Salmora Sub-Centre', 26.8820, 94.2980, 1150, 'River / Pond Sand Filter', 44.0, 'VERY_HIGH', 4),

-- Barpeta (Assam)
(5, 2, 'Howly North Ward', 'AS-BRP-001', 'Howly Sub-Centre', 26.4310, 90.9680, 2900, 'Deep Tube Well', 75.0, 'MEDIUM', 5),
(6, 2, 'Kalgachia Char Colony', 'AS-BRP-002', 'Kalgachia Sub-Centre', 26.2415, 90.7290, 3400, 'River Bank Shallow Wells', 36.0, 'VERY_HIGH', 5),
(7, 2, 'Sarthebari Bell Metal', 'AS-BRP-003', 'Sarthebari Sub-Centre', 26.3780, 91.1350, 1980, 'Piped Water Supply (JJM)', 82.0, 'LOW', 5),

-- Dhemaji (Assam - Flash Flood Prone)
(8, 3, 'Jonai Border Village', 'AS-DHJ-001', 'Jonai Sub-Centre', 27.8340, 95.1620, 1650, 'Spring / Tube Well', 62.0, 'HIGH', 4),
(9, 3, 'Silapathar Gaon', 'AS-DHJ-002', 'Silapathar Sub-Centre', 27.5910, 94.7210, 2100, 'Shallow Hand Pump', 55.0, 'HIGH', 4),

-- East Khasi Hills (Meghalaya)
(10, 4, 'Sohra / Cherrapunji Rim', 'ML-EKH-001', 'Cherrapunji CHC', 25.2740, 91.7320, 1850, 'Natural Mountain Spring', 88.0, 'LOW', 6),
(11, 4, 'Mawsynram East', 'ML-EKH-002', 'Mawsynram Sub-Centre', 25.2980, 91.5820, 1200, 'Stream Gravity Flow', 84.0, 'MEDIUM', 6),
(12, 4, 'Pynursla Ridge', 'ML-EKH-003', 'Pynursla Sub-Centre', 25.3110, 91.8970, 1540, 'Spring Tank', 78.0, 'LOW', 6),
(13, 4, 'Mawlynnong Eco-Village', 'ML-EKH-004', 'Riwai Sub-Centre', 25.2017, 91.9161, 650, 'Spring Filtered Storage', 98.0, 'LOW', 6),

-- West Garo Hills (Meghalaya)
(14, 5, 'Tura Dobasipara', 'ML-WGH-001', 'Tura Town Sub-Centre', 25.5140, 90.2030, 2600, 'Piped Gravity Spring', 72.0, 'MEDIUM', 6),
(15, 5, 'Tikrikilla Plain', 'ML-WGH-002', 'Tikrikilla Sub-Centre', 25.9230, 90.1580, 1950, 'Shallow Ring Well', 49.0, 'HIGH', 6),

-- Dhalai (Tripura)
(16, 6, 'Ambassa Tribal Basti', 'TR-DHL-001', 'Ambassa Sub-Centre', 23.9210, 91.8540, 1420, 'River Intake & Tube Well', 64.0, 'MEDIUM', 4),
(17, 6, 'Gandacherra Border', 'TR-DHL-002', 'Gandacherra Sub-Centre', 23.4830, 91.9540, 1780, 'Lake Water / Hand Pump', 45.0, 'HIGH', 4),

-- Papum Pare (Arunachal Pradesh)
(18, 7, 'Doimukh Foothills', 'AR-PAP-001', 'Doimukh Sub-Centre', 27.1420, 93.7540, 1920, 'Dikrong River / Gravity Pipe', 70.0, 'MEDIUM', 4),
(19, 7, 'Sagalee Valley', 'AR-PAP-002', 'Sagalee Sub-Centre', 27.2410, 93.4210, 980, 'Mountain Stream', 76.0, 'LOW', 4),

-- Champhai (Mizoram)
(20, 8, 'Zokhawthar Border Gate', 'MZ-CMP-001', 'Zokhawthar Sub-Centre', 23.3620, 93.3820, 1340, 'Spring Water Reservoir', 85.0, 'LOW', 6);

-- 5. Insert Sample Observations (Baseline & Recent Monsoon Surge)
INSERT INTO observations (id, village_id, recorded_by_user_id, observation_date, rainfall_mm, water_source_type, turbidity_ntu, ph_level, e_coli_detected, residual_chlorine_ppm, chlorination_done, latrine_coverage_pct, open_drainage_flag, reported_diarrhea_cases, reported_cholera_suspects, reported_typhoid_suspects, total_gastro_cases, notes, submission_channel, sync_status, created_at) VALUES
-- High-Risk Outbreak Surge in Kamalabari Ghat (Majuli) after heavy flood runoff
(1, 2, 4, '2026-09-18', 165.5, 'River / Shallow Borewell', 28.5, 7.8, TRUE, 0.05, FALSE, 52.0, TRUE, 18, 2, 1, 21, 'Heavy Brahmaputra flood runoff entered shallow open well. Multiple children showing acute watery diarrhea.', 'ONLINE_WEB', 'SYNCED', '2026-09-18 10:30:00'),

-- High-Risk Contamination in Kalgachia Char Colony (Barpeta)
(2, 6, 5, '2026-09-19', 142.0, 'River Bank Shallow Wells', 24.0, 7.9, TRUE, 0.00, FALSE, 36.0, TRUE, 14, 1, 0, 15, 'Char island inundated. Drinking water source submerged by floodwaters. Bleaching powder needed urgently.', 'ONLINE_WEB', 'SYNCED', '2026-09-19 11:15:00'),

-- Medium Risk in Salmora Pottery Village (Majuli)
(3, 4, 4, '2026-09-19', 95.0, 'River / Pond Sand Filter', 14.2, 7.4, TRUE, 0.10, TRUE, 44.0, TRUE, 6, 0, 0, 6, 'Pond sand filter overflowing due to rain. Precautionary halogen tablets distributed.', 'ONLINE_WEB', 'SYNCED', '2026-09-19 14:00:00'),

-- Medium Risk in Tikrikilla Plain (West Garo Hills)
(4, 15, 6, '2026-09-19', 88.0, 'Shallow Ring Well', 12.5, 6.9, FALSE, 0.15, FALSE, 49.0, TRUE, 5, 0, 0, 5, 'Moderate turbidity detected in community ring well. Advised villagers to boil water.', 'OFFLINE_SYNC', 'SYNCED', '2026-09-19 16:45:00'),

-- Low Risk in Mawlynnong Eco-Village (Meghalaya) - High sanitation baseline
(5, 13, 6, '2026-09-20', 110.0, 'Spring Filtered Storage', 2.1, 7.1, FALSE, 0.45, TRUE, 98.0, FALSE, 0, 0, 0, 0, 'Rainfall heavy but filtration chamber clean. Residual chlorine within optimal standard.', 'ONLINE_WEB', 'SYNCED', '2026-09-20 09:10:00'),

-- Low Risk in Sarthebari Bell Metal (Barpeta) - Piped water system
(6, 7, 5, '2026-09-20', 35.0, 'Piped Water Supply (JJM)', 1.8, 7.2, FALSE, 0.50, TRUE, 82.0, FALSE, 1, 0, 0, 1, 'Routine JJM tap water testing normal. No case clustering detected.', 'ONLINE_WEB', 'SYNCED', '2026-09-20 10:20:00'),

-- Medium Risk in Garamur Chariali (Majuli)
(7, 1, 4, '2026-09-20', 78.0, 'Tube Well / Hand Pump', 9.5, 7.3, FALSE, 0.20, TRUE, 68.0, FALSE, 4, 0, 0, 4, 'Slight turbidity after storm. Chlorination performed on community pump.', 'ONLINE_WEB', 'SYNCED', '2026-09-20 11:30:00'),

-- High Risk in Gandacherra Border (Tripura)
(8, 17, 4, '2026-09-21', 130.0, 'Lake Water / Hand Pump', 22.0, 7.6, TRUE, 0.02, FALSE, 45.0, TRUE, 11, 1, 0, 12, 'Surface run-off contaminated lake intake. Cluster of acute gastroenteritis reported in Ward 3.', 'ONLINE_WEB', 'SYNCED', '2026-09-21 08:45:00');

-- 6. Insert Predictions
INSERT INTO predictions (id, observation_id, village_id, risk_score, risk_category, confidence_pct, model_version, model_type, rainfall_factor_pct, water_quality_factor_pct, case_trend_factor_pct, sanitation_factor_pct, summary_recommendation, created_at) VALUES
(1, 1, 2, 88.50, 'HIGH', 92.0, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 32.0, 35.0, 23.0, 10.0, 'URGENT: Initiate source super-chlorination, deploy ORS/Zinc depots, issue non-diagnostic boil-water advisory.', '2026-09-18 10:30:05'),
(2, 2, 6, 84.00, 'HIGH', 89.5, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 30.0, 32.0, 24.0, 14.0, 'URGENT: Floodwater contamination detected. Deploy emergency water purification units and activate ASHA daily fever/diarrhea monitoring.', '2026-09-19 11:15:06'),
(3, 3, 4, 58.20, 'MEDIUM', 86.0, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 28.0, 26.0, 22.0, 24.0, 'MODERATE RISK: Inspect sand filter, distribute chlorine tablets to households, monitor for symptomatic progression.', '2026-09-19 14:00:04'),
(4, 4, 15, 52.80, 'MEDIUM', 84.0, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 25.0, 27.0, 20.0, 28.0, 'MODERATE RISK: Disinfect community ring well with bleaching powder; sample water in 48 hours.', '2026-09-19 16:45:05'),
(5, 5, 13, 14.50, 'LOW', 95.0, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 18.0, 5.0, 2.0, 75.0, 'LOW RISK: High baseline sanitation protective effect. Continue standard monthly surveillance.', '2026-09-20 09:10:04'),
(6, 6, 7, 18.20, 'LOW', 93.0, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 12.0, 6.0, 4.0, 78.0, 'LOW RISK: JJM treated water supply stable. Normal community health indicators.', '2026-09-20 10:20:05'),
(7, 7, 1, 46.50, 'MEDIUM', 85.0, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 29.0, 24.0, 21.0, 26.0, 'MODERATE RISK: Post-storm runoff observed. Maintain chlorination vigilance.', '2026-09-20 11:30:04'),
(8, 8, 17, 81.30, 'HIGH', 88.0, 'v1.2-ensemble-rf-xgb', 'HYBRID_ML_EPIDEMIOLOGICAL', 31.0, 33.0, 22.0, 14.0, 'URGENT: High turbidity + E. coli presence. Restrict raw lake water consumption and dispatch mobile health team.', '2026-09-21 08:45:05');

-- 7. Insert Explainability Factors
INSERT INTO prediction_explanations (prediction_id, factor_key, factor_name, factor_value, impact_direction, contribution_weight, explanation_text) VALUES
-- For Prediction #1 (Kamalabari Ghat)
(1, 'RAINFALL_ANOMALY', 'Monsoon Rainfall Surge', '165.5 mm', 'INCREASES_RISK', 0.320, 'Excessive rainfall exceeding 150mm triggers severe surface runoff and aquifer contamination in floodplains.'),
(1, 'WATER_QUALITY_TURBIDITY', 'High Water Turbidity', '28.5 NTU', 'INCREASES_RISK', 0.230, 'Turbidity is 5.7x above the permissible BIS standard (5 NTU), protecting microbial pathogens from UV disinfection.'),
(1, 'E_COLI_PRESENCE', 'Coliform Bacteria Detected', 'Positive (E. coli)', 'INCREASES_RISK', 0.210, 'Confirmed fecal contamination biomarker detected in primary drinking source.'),
(1, 'CASE_CLUSTER', 'Acute Gastro Trend', '21 cases reported', 'INCREASES_RISK', 0.180, 'Reported gastrointestinal illness has doubled over the 7-day baseline average.'),
(1, 'SANITATION_VULNERABILITY', 'Open Drainage Proximity', 'Open drainage present', 'INCREASES_RISK', 0.060, 'Low latrine coverage (52%) and open drainage accelerate community-wide transmission.'),

-- For Prediction #5 (Mawlynnong - Low Risk Explanations)
(5, 'SANITATION_PROTECTION', 'Exemplary Sanitation Baseline', '98% Latrine Coverage', 'DECREASES_RISK', -0.450, 'High community sanitation acts as a primary barrier against fecal-oral disease vectors.'),
(5, 'WATER_PURITY', 'Clean Source Turbidity', '2.1 NTU', 'DECREASES_RISK', -0.300, 'Turbidity is well within safe drinking water threshold (< 5 NTU).'),
(5, 'RESIDUAL_CHLORINE', 'Adequate Disinfection', '0.45 ppm chlorine', 'DECREASES_RISK', -0.150, 'Protective residual chlorine kills water-borne bacteria.');

-- 8. Insert Early-Warning Alerts
INSERT INTO alerts (id, prediction_id, village_id, alert_code, alert_level, trigger_reason, recommended_actions, status, reviewed_by_user_id, reviewed_at, resolution_notes, created_at) VALUES
(1, 1, 2, 'ALT-20260918-001', 'HIGH_RISK_OUTBREAK_SURGE', 'Compound trigger: Heavy monsoon rainfall (165.5mm), E. coli positive, turbidity 28.5 NTU, and 21 gastroenteritis cases.', '1. Issue non-diagnostic boil-water advisory in Kamalabari Sub-Centre.\n2. Dispatch PHE chlorination team to disinfect shallow borewells.\n3. ASHA workers to distribute ORS and zinc packets door-to-door.', 'NEW', NULL, NULL, NULL, '2026-09-18 10:30:10'),
(2, 2, 6, 'ALT-20260919-002', 'HIGH_RISK_OUTBREAK_SURGE', 'Inundation trigger: 142mm rainfall with submerged riverbank wells and 15 reported acute cases.', '1. Provide packaged drinking water to char colony residents.\n2. Conduct emergency water sample testing at district lab.\n3. Mobilize mobile medical unit for supportive hydration care.', 'REVIEWED', 2, '2026-09-19 15:00:00', 'Alert acknowledged by DHO Barpeta. 500 halogen tablets dispatched to ASHA Anowara Begum.', '2026-09-19 11:15:10'),
(3, 8, 17, 'ALT-20260921-003', 'HIGH_RISK_OUTBREAK_SURGE', 'Contamination trigger: 130mm rainfall, high turbidity (22 NTU), and 12 gastroenteritis cases in Gandacherra.', '1. Restrict unfiltered lake water consumption immediately.\n2. Inspect upstream runoff drainage points.\n3. Intensify village-level syndromic reporting.', 'NEW', NULL, NULL, NULL, '2026-09-21 08:45:10');

-- 9. Insert Sample What-If Simulations
INSERT INTO simulation_runs (user_id, village_id, base_rainfall_mm, simulated_rainfall_mm, rainfall_delta_pct, base_risk_score, base_risk_category, simulated_risk_score, simulated_risk_category, delta_score) VALUES
(2, 2, 165.5, 215.15, 30.0, 88.50, 'HIGH', 94.20, 'HIGH', 5.70),
(2, 4, 95.0, 123.50, 30.0, 58.20, 'MEDIUM', 74.80, 'HIGH', 16.60),
(3, 13, 110.0, 143.00, 30.0, 14.50, 'LOW', 22.10, 'LOW', 7.60);
