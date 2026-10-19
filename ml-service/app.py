"""
Flask REST API for Water-Borne Disease Early Warning ML Service.
Endpoints:
- GET  /health           : Microservice health & model metadata
- POST /predict          : Evaluates single observation & returns XAI output
- POST /simulate         : Runs What-If rainfall scenario
- POST /batch-predict    : Evaluates array of observations
"""

import os
from flask import Flask, request, jsonify
from model import DiseaseRiskPredictor

app = Flask(__name__)
predictor = DiseaseRiskPredictor()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'HEALTHY',
        'service': 'Smart Health ML Risk & Explainability Engine (Northeast India)',
        'model_version': predictor.metadata.get('version', 'v1.2-ensemble-rf-xgb'),
        'model_type': predictor.metadata.get('model_type', 'HYBRID_ML_EPIDEMIOLOGICAL'),
        'features_supported': len(predictor.metadata.get('feature_names', []))
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400
    
    try:
        result = predictor.predict(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400
    
    delta_pct = float(data.get('rainfall_delta_pct', 20.0))
    observation_data = data.get('observation', data)
    
    try:
        result = predictor.simulate_rainfall(observation_data, delta_pct)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Simulation failed: {str(e)}'}), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    data = request.get_json(force=True, silent=True)
    if not data or not isinstance(data, list):
        return jsonify({'error': 'Payload must be a JSON array of observation records'}), 400
    
    results = []
    for item in data:
        try:
            res = predictor.predict(item)
            results.append({'success': True, 'data': res})
        except Exception as e:
            results.append({'success': False, 'error': str(e)})
            
    return jsonify({'total': len(data), 'predictions': results}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Smart Health ML Microservice on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
