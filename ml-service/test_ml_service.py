"""
Unit Tests for ML Microservice & Explainability Engine.
"""

import unittest
from model import DiseaseRiskPredictor

class TestDiseaseRiskPredictor(unittest.TestCase):
    def setUp(self):
        self.predictor = DiseaseRiskPredictor()

    def test_high_risk_flood_scenario(self):
        # Severe flood in Majuli Island
        data = {
            'rainfall_mm': 180.0,
            'turbidity_ntu': 28.0,
            'ph_level': 7.6,
            'e_coli_detected': True,
            'residual_chlorine_ppm': 0.0,
            'chlorination_done': False,
            'latrine_coverage_pct': 40.0,
            'open_drainage_flag': True,
            'reported_diarrhea_cases': 15,
            'reported_cholera_suspects': 2,
            'reported_typhoid_suspects': 1
        }
        res = self.predictor.predict(data)
        self.assertEqual(res['risk_category'], 'HIGH')
        self.assertGreaterEqual(res['risk_score'], 70.0)
        self.assertIn('explanations', res)
        self.assertGreater(len(res['explanations']), 0)
        # Verify non-diagnostic recommendation exists
        self.assertIn('boil-water', res['summary_recommendation'].lower())

    def test_low_risk_clean_spring_scenario(self):
        # Mawlynnong clean spring water with high sanitation
        data = {
            'rainfall_mm': 25.0,
            'turbidity_ntu': 1.8,
            'ph_level': 7.2,
            'e_coli_detected': False,
            'residual_chlorine_ppm': 0.45,
            'chlorination_done': True,
            'latrine_coverage_pct': 96.0,
            'open_drainage_flag': False,
            'reported_diarrhea_cases': 0,
            'reported_cholera_suspects': 0,
            'reported_typhoid_suspects': 0
        }
        res = self.predictor.predict(data)
        self.assertEqual(res['risk_category'], 'LOW')
        self.assertLess(res['risk_score'], 35.0)

    def test_what_if_simulation(self):
        base_data = {
            'rainfall_mm': 80.0,
            'turbidity_ntu': 10.0,
            'ph_level': 7.0,
            'e_coli_detected': False,
            'residual_chlorine_ppm': 0.1,
            'chlorination_done': False,
            'latrine_coverage_pct': 60.0,
            'open_drainage_flag': True,
            'reported_diarrhea_cases': 3,
            'reported_cholera_suspects': 0,
            'reported_typhoid_suspects': 0
        }
        sim = self.predictor.simulate_rainfall(base_data, delta_pct=30.0)
        self.assertEqual(sim['rainfall_delta_pct'], 30.0)
        self.assertGreater(sim['simulated_rainfall_mm'], sim['base_rainfall_mm'])
        self.assertGreaterEqual(sim['simulated_risk_score'], sim['base_risk_score'])

if __name__ == '__main__':
    unittest.main()
