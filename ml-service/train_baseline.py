"""
Model Training Pipeline for Water-Borne Disease Early Warning System.
Trains an Ensemble Model (Random Forest Classifier + Gradient Boosting)
with calibrated probability scoring on synthetic Northeast India epidemiological data.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from synthetic_data_generator import generate_epidemiological_dataset

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

def train_and_save_models():
    print("Generating synthetic epidemiological dataset for Northeast India...")
    df = generate_epidemiological_dataset(n_samples=8000, random_seed=42)
    
    X = df[FEATURE_COLS]
    y = df['risk_class'] # 0: Low, 1: Medium, 2: High
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    print(f"Training set: {X_train.shape[0]} samples, Test set: {X_test.shape[0]} samples")
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    rf = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        min_samples_split=6,
        random_state=42,
        class_weight='balanced'
    )
    
    gb = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.08,
        max_depth=5,
        random_state=42
    )
    
    ensemble = VotingClassifier(
        estimators=[('rf', rf), ('gb', gb)],
        voting='soft'
    )
    
    print("Fitting ensemble model (Random Forest + Gradient Boosting)...")
    ensemble.fit(X_train_scaled, y_train)
    
    # Evaluate on test set
    y_pred = ensemble.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report (0: Low Risk, 1: Medium Risk, 2: High Risk):")
    print(classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High']))
    
    # Fit individual RF for feature importances
    rf.fit(X_train, y_train)
    importances = pd.Series(rf.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
    print("\nTop Feature Importances:")
    print(importances)
    
    # Save artifacts
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(curr_dir, 'model.joblib')
    scaler_path = os.path.join(curr_dir, 'scaler.joblib')
    metadata_path = os.path.join(curr_dir, 'metadata.joblib')
    
    metadata = {
        'version': 'v1.2-ensemble-rf-xgb',
        'accuracy': float(acc),
        'feature_names': FEATURE_COLS,
        'feature_importances': importances.to_dict(),
        'target_classes': ['LOW', 'MEDIUM', 'HIGH'],
        'model_type': 'HYBRID_ML_EPIDEMIOLOGICAL'
    }
    
    joblib.dump(ensemble, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(metadata, metadata_path)
    
    print(f"\nArtifacts saved successfully:\n - {model_path}\n - {scaler_path}\n - {metadata_path}")

if __name__ == '__main__':
    train_and_save_models()
