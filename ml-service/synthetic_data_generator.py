"""
Synthetic Epidemiological Data Generator for Northeast India Rural Water-Borne Disease Surveillance.
Generates realistic, scientifically grounded synthetic surveillance datasets modeling:
- Brahmaputra / Barak / Meghalaya river basin hydrological dynamics
- Monsoon rainfall surges (0 to 350+ mm)
- Water quality parameters (Turbidity NTU, pH, E. coli biomarker, Free Chlorine)
- Village infrastructure (Sanitation coverage %, Open drainage)
- Reported syndromic case loads (Diarrhea, Cholera suspects, Typhoid suspects)
"""

import numpy as np
import pandas as pd
import os

def generate_epidemiological_dataset(n_samples=5000, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Geographic / Terrain Archetypes in Northeast India
    terrain_types = ['FLOODPLAIN_ISLAND', 'HILL_RIDGE', 'RIVER_CHAR', 'VALLEY_FOOTHILL']
    terrains = np.random.choice(terrain_types, size=n_samples, p=[0.35, 0.25, 0.25, 0.15])
    
    # 2. Rainfall (mm) - Highly skewed monsoon distribution (Log-normal + extreme peaks)
    rainfall_base = np.random.exponential(scale=45.0, size=n_samples)
    monsoon_multiplier = np.random.choice([1.0, 1.8, 2.5, 3.2], size=n_samples, p=[0.40, 0.30, 0.20, 0.10])
    rainfall_mm = np.clip(rainfall_base * monsoon_multiplier, 0.0, 380.0)
    
    # 3. Sanitation Coverage (Percentage 20% to 100%)
    # Hill ridges (e.g., Mawlynnong) have higher sanitation; chars have lower.
    latrine_coverage = np.zeros(n_samples)
    for i, t in enumerate(terrains):
        if t == 'HILL_RIDGE':
            latrine_coverage[i] = np.clip(np.random.normal(82, 10), 40, 100)
        elif t == 'RIVER_CHAR':
            latrine_coverage[i] = np.clip(np.random.normal(45, 12), 15, 80)
        else:
            latrine_coverage[i] = np.clip(np.random.normal(64, 15), 25, 95)
            
    # Open drainage flag
    open_drainage_prob = 1.0 - (latrine_coverage / 120.0)
    open_drainage = (np.random.rand(n_samples) < open_drainage_prob).astype(int)
    
    # 4. Water Quality Parameters
    # Turbidity (NTU) correlates with rainfall and flood terrain
    turbidity_base = np.random.gamma(shape=2.5, scale=3.0, size=n_samples)
    runoff_effect = (rainfall_mm / 35.0) * (1.5 if np.random.rand() > 0.5 else 0.8)
    turbidity_ntu = np.clip(turbidity_base + runoff_effect, 0.5, 95.0)
    
    # pH Level (Safe range: 6.5 - 8.5; acidic in some peaty soils or basic with contamination)
    ph_level = np.clip(np.random.normal(7.2, 0.45, size=n_samples), 5.5, 9.2)
    
    # Chlorination practice & Residual Chlorine ppm
    chlorination_done = (np.random.rand(n_samples) < (latrine_coverage / 110.0)).astype(int)
    residual_chlorine = np.where(
        chlorination_done == 1,
        np.clip(np.random.normal(0.35, 0.15, size=n_samples), 0.05, 0.90),
        np.clip(np.random.normal(0.02, 0.02, size=n_samples), 0.0, 0.08)
    )
    
    # E. coli / Coliform presence probability
    # Increases with high turbidity, low chlorine, high rainfall, low sanitation
    ecoli_logit = (
        0.04 * turbidity_ntu 
        + 0.015 * rainfall_mm 
        - 0.035 * latrine_coverage 
        + 0.8 * open_drainage 
        - 4.0 * residual_chlorine 
        - 0.5
    )
    ecoli_prob = 1.0 / (1.0 + np.exp(-ecoli_logit))
    e_coli_detected = (np.random.rand(n_samples) < ecoli_prob).astype(int)
    
    # 5. Reported Cases (Syndromic surveillance)
    # Diarrhea cases
    case_expected = (
        0.05 * rainfall_mm 
        + 0.25 * turbidity_ntu 
        + 6.0 * e_coli_detected 
        + 3.0 * open_drainage 
        - 0.08 * latrine_coverage 
        - 5.0 * residual_chlorine
    )
    case_expected = np.maximum(case_expected, 0.2)
    reported_diarrhea = np.random.poisson(case_expected)
    reported_cholera_suspects = np.random.poisson(np.maximum((case_expected - 8.0) * 0.15, 0.0))
    reported_typhoid_suspects = np.random.poisson(np.maximum((case_expected - 5.0) * 0.10, 0.0))
    total_gastro_cases = reported_diarrhea + reported_cholera_suspects + reported_typhoid_suspects
    
    # 6. Epidemiological Composite Risk Calculation (Ground Truth Label)
    # Composite Score in [0.0, 100.0]
    # Factors:
    # A. Water Contamination (40%): Turbidity + E. coli - Chlorine
    # B. Hydrological Hazard (25%): Rainfall Runoff
    # C. Syndromic Outbreak Signal (25%): Active gastro cases
    # D. Vulnerability Baseline (10%): Low sanitation + open drainage
    
    water_score = np.clip((turbidity_ntu / 30.0) * 45.0 + (e_coli_detected * 40.0) - (residual_chlorine * 35.0), 0.0, 100.0)
    rain_score = np.clip((rainfall_mm / 150.0) * 100.0, 0.0, 100.0)
    case_score = np.clip((total_gastro_cases / 15.0) * 100.0, 0.0, 100.0)
    sanitation_score = np.clip((100.0 - latrine_coverage) * 0.7 + (open_drainage * 30.0), 0.0, 100.0)
    
    composite_risk_score = (
        0.35 * water_score +
        0.25 * rain_score +
        0.25 * case_score +
        0.15 * sanitation_score
    )
    
    # Add minor stochastic environmental noise (+/- 4%)
    noise = np.random.normal(0, 3.5, size=n_samples)
    composite_risk_score = np.clip(composite_risk_score + noise, 0.0, 100.0)
    
    # Multi-class Target: 0: Low Risk (<35), 1: Medium Risk (35-70), 2: High Risk (>=70)
    risk_category = np.where(composite_risk_score >= 70.0, 'HIGH',
                    np.where(composite_risk_score >= 35.0, 'MEDIUM', 'LOW'))
    
    risk_class = np.where(composite_risk_score >= 70.0, 2,
                 np.where(composite_risk_score >= 35.0, 1, 0))
    
    df = pd.DataFrame({
        'rainfall_mm': np.round(rainfall_mm, 2),
        'turbidity_ntu': np.round(turbidity_ntu, 2),
        'ph_level': np.round(ph_level, 2),
        'e_coli_detected': e_coli_detected,
        'residual_chlorine_ppm': np.round(residual_chlorine, 2),
        'chlorination_done': chlorination_done,
        'latrine_coverage_pct': np.round(latrine_coverage, 2),
        'open_drainage_flag': open_drainage,
        'reported_diarrhea_cases': reported_diarrhea,
        'reported_cholera_suspects': reported_cholera_suspects,
        'reported_typhoid_suspects': reported_typhoid_suspects,
        'total_gastro_cases': total_gastro_cases,
        'composite_risk_score': np.round(composite_risk_score, 2),
        'risk_category': risk_category,
        'risk_class': risk_class
    })
    
    return df

if __name__ == '__main__':
    data_dir = os.path.dirname(os.path.abspath(__file__))
    df = generate_epidemiological_dataset(n_samples=6000)
    output_path = os.path.join(data_dir, 'synthetic_northeast_health_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic epidemiological records at {output_path}")
    print("Class distribution:")
    print(df['risk_category'].value_counts(normalize=True))
