"""
Explainable AI (XAI) & Public Health Decision Support Module.
Translates mathematical feature contributions into actionable, non-diagnostic
insights tailored for ASHA/ANM health workers and District Health Officers (DHO).
"""

from typing import Dict, List, Any

# Safe thresholds based on Indian Standard Drinking Water Specification (IS 10500: 2012)
# and National Health Mission / IDSP surveillance guidelines
THRESHOLDS = {
    'TURBIDITY_SAFE_MAX_NTU': 5.0,
    'TURBIDITY_CRITICAL_NTU': 15.0,
    'PH_MIN': 6.5,
    'PH_MAX': 8.5,
    'CHLORINE_OPTIMAL_MIN_PPM': 0.20,
    'RAINFALL_HEAVY_MM': 75.0,
    'RAINFALL_EXTREME_MM': 130.0,
    'LATRINE_POOR_THRESHOLD_PCT': 50.0
}

def generate_explanations(features: Dict[str, Any], risk_score: float, risk_category: str) -> List[Dict[str, Any]]:
    """
    Generates structured, transparent factor contributions and plain-English explanations.
    """
    explanations = []
    
    rainfall_mm = float(features.get('rainfall_mm', 0.0))
    turbidity_ntu = float(features.get('turbidity_ntu', 1.0))
    ph_level = float(features.get('ph_level', 7.0))
    e_coli = bool(features.get('e_coli_detected', False)) or int(features.get('e_coli_detected', 0)) == 1
    residual_chlorine = float(features.get('residual_chlorine_ppm', 0.0))
    chlorination_done = bool(features.get('chlorination_done', False)) or int(features.get('chlorination_done', 0)) == 1
    latrine_cov = float(features.get('latrine_coverage_pct', 70.0))
    open_drainage = bool(features.get('open_drainage_flag', False)) or int(features.get('open_drainage_flag', 0)) == 1
    diarrhea_cases = int(features.get('reported_diarrhea_cases', 0))
    cholera_cases = int(features.get('reported_cholera_suspects', 0))
    typhoid_cases = int(features.get('reported_typhoid_suspects', 0))
    total_cases = diarrhea_cases + cholera_cases + typhoid_cases
    
    # 1. Rainfall / Hydrological Hazard Factor
    if rainfall_mm >= THRESHOLDS['RAINFALL_EXTREME_MM']:
        explanations.append({
            'factor_key': 'RAINFALL_EXTREME',
            'factor_name': 'Torrential Monsoon Rainfall',
            'factor_value': f'{rainfall_mm:.1f} mm',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.32,
            'explanation_text': f'Rainfall of {rainfall_mm:.1f} mm significantly increases agricultural & surface runoff into unprotected village water sources.'
        })
    elif rainfall_mm >= THRESHOLDS['RAINFALL_HEAVY_MM']:
        explanations.append({
            'factor_key': 'RAINFALL_HEAVY',
            'factor_name': 'Elevated Rainfall',
            'factor_value': f'{rainfall_mm:.1f} mm',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.18,
            'explanation_text': f'Recent rainfall ({rainfall_mm:.1f} mm) increases the likelihood of silt washing into ring wells and streams.'
        })
    else:
        explanations.append({
            'factor_key': 'RAINFALL_NORMAL',
            'factor_name': 'Dry / Moderate Rainfall',
            'factor_value': f'{rainfall_mm:.1f} mm',
            'impact_direction': 'DECREASES_RISK',
            'contribution_weight': -0.10,
            'explanation_text': f'Rainfall levels ({rainfall_mm:.1f} mm) are within normal baseline ranges, reducing immediate runoff risks.'
        })
        
    # 2. Water Quality - Turbidity & E. coli
    if turbidity_ntu >= THRESHOLDS['TURBIDITY_CRITICAL_NTU']:
        explanations.append({
            'factor_key': 'TURBIDITY_CRITICAL',
            'factor_name': 'Severe Water Turbidity',
            'factor_value': f'{turbidity_ntu:.1f} NTU',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.28,
            'explanation_text': f'Water cloudiness ({turbidity_ntu:.1f} NTU) is {(turbidity_ntu/5.0):.1f}x higher than safe BIS limits (5 NTU), sheltering bacteria from natural disinfection.'
        })
    elif turbidity_ntu > THRESHOLDS['TURBIDITY_SAFE_MAX_NTU']:
        explanations.append({
            'factor_key': 'TURBIDITY_ELEVATED',
            'factor_name': 'Moderate Turbidity',
            'factor_value': f'{turbidity_ntu:.1f} NTU',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.14,
            'explanation_text': f'Turbidity ({turbidity_ntu:.1f} NTU) is slightly above the desirable limit (5 NTU).'
        })
    else:
        explanations.append({
            'factor_key': 'TURBIDITY_CLEAR',
            'factor_name': 'Clear Water Quality',
            'factor_value': f'{turbidity_ntu:.1f} NTU',
            'impact_direction': 'DECREASES_RISK',
            'contribution_weight': -0.15,
            'explanation_text': f'Water clarity ({turbidity_ntu:.1f} NTU) meets the national drinking water standard.'
        })

    if e_coli:
        explanations.append({
            'factor_key': 'E_COLI_POSITIVE',
            'factor_name': 'Coliform / E. Coli Biomarker Detected',
            'factor_value': 'Positive (Detected)',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.35,
            'explanation_text': 'Field test detected fecal indicator bacteria in community drinking supply, indicating high risk of water-borne transmission.'
        })
        
    # 3. Disinfection / Chlorination
    if chlorination_done and residual_chlorine >= THRESHOLDS['CHLORINE_OPTIMAL_MIN_PPM']:
        explanations.append({
            'factor_key': 'CHLORINATION_EFFECTIVE',
            'factor_name': 'Protective Chlorination Level',
            'factor_value': f'{residual_chlorine:.2f} ppm',
            'impact_direction': 'DECREASES_RISK',
            'contribution_weight': -0.22,
            'explanation_text': f'Free residual chlorine ({residual_chlorine:.2f} ppm) provides active bactericidal protection against enteric pathogens.'
        })
    elif not chlorination_done or residual_chlorine < 0.05:
        explanations.append({
            'factor_key': 'CHLORINE_DEFICIENT',
            'factor_name': 'Lack of Residual Disinfection',
            'factor_value': f'{residual_chlorine:.2f} ppm',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.12,
            'explanation_text': 'Insufficient residual chlorine leaves the community distribution network vulnerable to microbial recontamination.'
        })

    # 4. Syndromic Case Trends
    if total_cases >= 10:
        explanations.append({
            'factor_key': 'CASE_SURGE_HIGH',
            'factor_name': 'Active Gastroenteritis Cluster',
            'factor_value': f'{total_cases} total cases ({diarrhea_cases} diarrhea, {cholera_cases} cholera suspects)',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.30,
            'explanation_text': f'High reported case count ({total_cases} symptomatic individuals) indicates an ongoing transmission event in the catchment area.'
        })
    elif total_cases >= 3:
        explanations.append({
            'factor_key': 'CASE_SURGE_MODERATE',
            'factor_name': 'Moderate Symptomatic Cases',
            'factor_value': f'{total_cases} cases reported',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.15,
            'explanation_text': f'{total_cases} symptomatic cases reported this period. Requires close household contact tracing.'
        })
    else:
        explanations.append({
            'factor_key': 'CASE_SURGE_LOW',
            'factor_name': 'Low Case Incidence',
            'factor_value': f'{total_cases} cases reported',
            'impact_direction': 'DECREASES_RISK',
            'contribution_weight': -0.12,
            'explanation_text': 'No unusual syndromic clustering observed in recent field surveillance.'
        })

    # 5. Sanitation & Infrastructure
    if latrine_cov < THRESHOLDS['LATRINE_POOR_THRESHOLD_PCT'] or open_drainage:
        explanations.append({
            'factor_key': 'SANITATION_VULNERABILITY',
            'factor_name': 'Sanitation & Drainage Deficit',
            'factor_value': f'{latrine_cov:.1f}% latrines, Open drainage: {"Yes" if open_drainage else "No"}',
            'impact_direction': 'INCREASES_RISK',
            'contribution_weight': 0.16,
            'explanation_text': 'Sub-optimal sanitation infrastructure and open drainage create pathways for wastewater to leach into local ground water.'
        })
    elif latrine_cov >= 80.0 and not open_drainage:
        explanations.append({
            'factor_key': 'SANITATION_PROTECTIVE',
            'factor_name': 'High Sanitation Coverage',
            'factor_value': f'{latrine_cov:.1f}% latrines',
            'impact_direction': 'DECREASES_RISK',
            'contribution_weight': -0.18,
            'explanation_text': 'Robust household latrine coverage reduces environmental fecal load and protects shallow water tables.'
        })

    # Sort explanations by absolute contribution weight descending
    explanations.sort(key=lambda x: abs(x['contribution_weight']), reverse=True)
    return explanations

def generate_recommendations(risk_category: str, features: Dict[str, Any]) -> str:
    """
    Generates plain-English non-diagnostic public health action recommendations.
    """
    if risk_category == 'HIGH':
        recs = [
            "1. Issue immediate Community Boil-Water Advisory across the sub-centre catchment.",
            "2. Mobilize PHE (Public Health Engineering) field team to super-chlorinate local tube wells and storage tanks.",
            "3. Deploy ASHA workers for active daily door-to-door case search, ORS and Zinc packet distribution.",
            "4. Send duplicate water samples to District Water Quality Testing Laboratory for microbiological culture."
        ]
    elif risk_category == 'MEDIUM':
        recs = [
            "1. Inspect community water source surroundings and clear stagnant water within 15-meter radius.",
            "2. Distribute chlorine (halogen) tablets and educate households on safe storage.",
            "3. Increase syndromic surveillance frequency from weekly to 48-hour intervals.",
            "4. Ensure sub-centre has adequate inventory of ORS, IV fluids, and zinc suspensions."
        ]
    else:
        recs = [
            "1. Maintain routine weekly environmental and syndromic health monitoring.",
            "2. Continue regular community awareness on clean water handling and hand hygiene.",
            "3. Verify that routine village water source bleaching schedules are up to date."
        ]
        
    return "\n".join(recs)
