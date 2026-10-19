"""
Risk Predictor Engine.
Loads the trained ML model or runs calibrated rule-based fallback if model is uninitialized.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from explainer import generate_explanations, generate_recommendations

FEATURE_COLS = [
    'rainfall_mm',
    'turbidity_ntu',
    'ph_level',
    'e_coli_detected',
    'residual_chlorine_ppm',
    'chlorination_done',
    'latrine_coverage_pct',
    'open_drainage_flag',
    'reported_diarrhea_cases',
    'reported_cholera_suspects',
    'reported_typhoid_suspects',
    'total_gastro_cases'
]

class DiseaseRiskPredictor:
    def __init__(self):
        self.curr_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(self.curr_dir, 'model.joblib')
        self.scaler_path = os.path.join(self.curr_dir, 'scaler.joblib')
        self.metadata_path = os.path.join(self.curr_dir, 'metadata.joblib')
        
        self.model = None
        self.scaler = None
        self.metadata = {
            'version': 'v1.2-ensemble-rf-xgb',
            'model_type': 'HYBRID_ML_EPIDEMIOLOGICAL'
        }
        self.load_or_train()

    def load_or_train(self):
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                if os.path.exists(self.metadata_path):
                    self.metadata = joblib.load(self.metadata_path)
                print("Trained ML Ensemble loaded successfully.")
            else:
                print("Model artifact not found. Training baseline model now...")
                from train_baseline import train_and_save_models
                train_and_save_models()
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.metadata = joblib.load(self.metadata_path)
        except Exception as e:
            print(f"Warning: Falling back to epidemiological scoring engine. Reason: {e}")

    def _prepare_vector(self, data: Dict[str, Any]) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        rainfall_mm = float(data.get('rainfall_mm', 0.0))
        turbidity_ntu = float(data.get('turbidity_ntu', 1.0))
        ph_level = float(data.get('ph_level', 7.0))
        e_coli = 1 if (data.get('e_coli_detected') in [True, 1, 'true', '1', 'POSITIVE']) else 0
        residual_chlorine = float(data.get('residual_chlorine_ppm', 0.0))
        chlorination = 1 if (data.get('chlorination_done') in [True, 1, 'true', '1']) else 0
        latrine_cov = float(data.get('latrine_coverage_pct', 65.0))
        open_drainage = 1 if (data.get('open_drainage_flag') in [True, 1, 'true', '1']) else 0
        diarrhea = int(data.get('reported_diarrhea_cases', 0))
        cholera = int(data.get('reported_cholera_suspects', 0))
        typhoid = int(data.get('reported_typhoid_suspects', 0))
        total_cases = int(data.get('total_gastro_cases', diarrhea + cholera + typhoid))
        if total_cases == 0 and (diarrhea + cholera + typhoid) > 0:
            total_cases = diarrhea + cholera + typhoid

        clean_dict = {
            'rainfall_mm': rainfall_mm,
            'turbidity_ntu': turbidity_ntu,
            'ph_level': ph_level,
            'e_coli_detected': e_coli,
            'residual_chlorine_ppm': residual_chlorine,
            'chlorination_done': chlorination,
            'latrine_coverage_pct': latrine_cov,
            'open_drainage_flag': open_drainage,
            'reported_diarrhea_cases': diarrhea,
            'reported_cholera_suspects': cholera,
            'reported_typhoid_suspects': typhoid,
            'total_gastro_cases': total_cases
        }
        df = pd.DataFrame([clean_dict])[FEATURE_COLS]
        return df, clean_dict

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        df, clean_dict = self._prepare_vector(input_data)
        
        # Calculate sub-factor percentages
        # Water Quality Factor
        water_val = (min(clean_dict['turbidity_ntu'] / 25.0, 1.0) * 0.45 +
                     clean_dict['e_coli_detected'] * 0.45 +
                     (0.0 if clean_dict['residual_chlorine_ppm'] > 0.2 else 0.10)) * 100.0
        water_factor = float(np.clip(water_val, 0.0, 100.0))

        # Rainfall Factor
        rain_val = min(clean_dict['rainfall_mm'] / 140.0, 1.0) * 100.0
        rain_factor = float(np.clip(rain_val, 0.0, 100.0))

        # Case Trend Factor
        case_val = min(clean_dict['total_gastro_cases'] / 12.0, 1.0) * 100.0
        case_factor = float(np.clip(case_val, 0.0, 100.0))

        # Sanitation Deficit Factor
        sanitation_val = ((100.0 - clean_dict['latrine_coverage_pct']) * 0.6 + clean_dict['open_drainage_flag'] * 40.0)
        sanitation_factor = float(np.clip(sanitation_val, 0.0, 100.0))

        if self.model is not None and self.scaler is not None:
            X_scaled = self.scaler.transform(df)
            probs = self.model.predict_proba(X_scaled)[0] # [p_low, p_medium, p_high]
            
            # Expected risk score from weighted probability
            # 0-35 (Low), 35-70 (Medium), 70-100 (High)
            risk_score = float(probs[0] * 18.0 + probs[1] * 52.0 + probs[2] * 88.0)
            confidence_pct = float(np.max(probs) * 100.0)
        else:
            # Epidemiological rule-based fallback
            risk_score = float(
                0.35 * water_factor +
                0.25 * rain_factor +
                0.25 * case_factor +
                0.15 * sanitation_factor
            )
            confidence_pct = 85.0

        risk_score = round(float(np.clip(risk_score, 0.0, 100.0)), 2)

        if risk_score >= 70.0:
            risk_category = 'HIGH'
        elif risk_score >= 35.0:
            risk_category = 'MEDIUM'
        else:
            risk_category = 'LOW'

        explanations = generate_explanations(clean_dict, risk_score, risk_category)
        recommendations = generate_recommendations(risk_category, clean_dict)

        return {
            'risk_score': risk_score,
            'risk_category': risk_category,
            'confidence_pct': round(confidence_pct, 1),
            'model_version': self.metadata.get('version', 'v1.2-ensemble-rf-xgb'),
            'model_type': self.metadata.get('model_type', 'HYBRID_ML_EPIDEMIOLOGICAL'),
            'sub_factors': {
                'rainfall_factor_pct': round(rain_factor, 1),
                'water_quality_factor_pct': round(water_factor, 1),
                'case_trend_factor_pct': round(case_factor, 1),
                'sanitation_factor_pct': round(sanitation_factor, 1)
            },
            'explanations': explanations,
            'summary_recommendation': recommendations
        }

    def simulate_rainfall(self, base_data: Dict[str, Any], delta_pct: float) -> Dict[str, Any]:
        """
        Runs counterfactual simulation by altering rainfall by delta_pct (e.g., +20%, -30%).
        """
        base_result = self.predict(base_data)
        
        sim_data = dict(base_data)
        base_rainfall = float(base_data.get('rainfall_mm', 0.0))
        sim_rainfall = max(0.0, base_rainfall * (1.0 + (delta_pct / 100.0)))
        sim_data['rainfall_mm'] = sim_rainfall
        
        # When rainfall surges, turbidity in surface water typically rises proportionally
        if delta_pct > 0:
            current_turbidity = float(base_data.get('turbidity_ntu', 1.0))
            sim_data['turbidity_ntu'] = current_turbidity * (1.0 + (delta_pct / 100.0) * 0.4)
            
        sim_result = self.predict(sim_data)
        
        score_diff = round(sim_result['risk_score'] - base_result['risk_score'], 2)
        
        return {
            'base_rainfall_mm': round(base_rainfall, 2),
            'simulated_rainfall_mm': round(sim_rainfall, 2),
            'rainfall_delta_pct': delta_pct,
            'base_risk_score': base_result['risk_score'],
            'base_risk_category': base_result['risk_category'],
            'simulated_risk_score': sim_result['risk_score'],
            'simulated_risk_category': sim_result['risk_category'],
            'delta_score': score_diff,
            'base_prediction': base_result,
            'simulated_prediction': sim_result,
            'simulation_note': f'Simulation with {delta_pct:+.1f}% rainfall shift reflects expected surface runoff and turbidity changes.'
        }
