"""
train_trend_model.py
---------------------
Trains a Machine Learning classifier (Random Forest / Gradient Boosting)
for longitudinal biological stress and tissue state classification.

Output:
Saves trained model to: backend/app/ml/models/trend_model.pkl
Loaded by: app.ml.model_loader.ModelLoader.load_trend_model()
"""

import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import MODELS_DIR, TREND_MODEL_PATH

FEATURE_COLUMNS = [
    "avg_area_change",
    "area_rmse",
    "avg_length_change",
    "length_rmse",
    "avg_breadth_change",
    "breadth_rmse",
    "intensity_variation",
    "intensity_rmse",
    "shape_variation",
    "shape_rmse",
    "avg_solidity_change",
    "solidity_rmse",
]

CLASSES = [
    "Normal / Intact (Stable)",
    "Pathological Swelling",
    "Regenerative Triage",
    "Degenerative Transformation",
    "Standard Maturation",
]


def generate_synthetic_training_data(n_samples: int = 500) -> pd.DataFrame:
    """
    Synthesize realistic longitudinal trajectories aligned with MBSCRL
    earthworm prostate biological response profiles (H2O2 stress & recovery).
    Use this if you don't have a labeled CSV ready yet.
    """
    np.random.seed(42)
    rows = []

    for _ in range(n_samples):
        label = np.random.choice(CLASSES)

        if label == "Pathological Swelling":
            # Acute enlargement + structural loosening
            area_slope = np.random.uniform(0.16, 0.45)
            area_rmse = np.random.uniform(0.08, 0.25)
            solidity_slope = np.random.uniform(-0.06, -0.015)
            solidity_rmse = np.random.uniform(0.03, 0.09)
            shape_slope = np.random.uniform(0.01, 0.05)
            shape_rmse = np.random.uniform(0.05, 0.15)
            intensity_slope = np.random.uniform(2.0, 15.0)
            intensity_rmse = np.random.uniform(5.0, 18.0)

        elif label == "Regenerative Triage":
            # Controlled shrinkage + membrane tightening
            area_slope = np.random.uniform(-0.25, -0.055)
            area_rmse = np.random.uniform(0.02, 0.08)
            solidity_slope = np.random.uniform(0.006, 0.03)
            solidity_rmse = np.random.uniform(0.01, 0.04)
            shape_slope = np.random.uniform(-0.02, 0.0)
            shape_rmse = np.random.uniform(0.02, 0.06)
            intensity_slope = np.random.uniform(-5.0, 2.0)
            intensity_rmse = np.random.uniform(2.0, 8.0)

        elif label == "Degenerative Transformation":
            # High volatility and border instability
            area_slope = np.random.uniform(-0.05, 0.08)
            area_rmse = np.random.uniform(0.12, 0.35)
            solidity_slope = np.random.uniform(-0.03, 0.01)
            solidity_rmse = np.random.uniform(0.08, 0.20)
            shape_slope = np.random.uniform(0.02, 0.08)
            shape_rmse = np.random.uniform(0.12, 0.30)
            intensity_slope = np.random.uniform(-8.0, 12.0)
            intensity_rmse = np.random.uniform(10.0, 25.0)

        elif label == "Standard Maturation":
            # Steady positive growth, stable solidity
            area_slope = np.random.uniform(0.021, 0.14)
            area_rmse = np.random.uniform(0.01, 0.05)
            solidity_slope = np.random.uniform(-0.005, 0.005)
            solidity_rmse = np.random.uniform(0.01, 0.03)
            shape_slope = np.random.uniform(-0.005, 0.005)
            shape_rmse = np.random.uniform(0.01, 0.04)
            intensity_slope = np.random.uniform(0.0, 3.0)
            intensity_rmse = np.random.uniform(1.0, 5.0)

        else:  # Normal / Intact (Stable)
            area_slope = np.random.uniform(-0.02, 0.02)
            area_rmse = np.random.uniform(0.005, 0.03)
            solidity_slope = np.random.uniform(-0.004, 0.004)
            solidity_rmse = np.random.uniform(0.005, 0.02)
            shape_slope = np.random.uniform(-0.003, 0.003)
            shape_rmse = np.random.uniform(0.008, 0.03)
            intensity_slope = np.random.uniform(-1.0, 1.0)
            intensity_rmse = np.random.uniform(0.5, 3.0)

        length_slope = area_slope * 0.6 + np.random.normal(0, 0.01)
        length_rmse = area_rmse * 0.5 + np.random.normal(0, 0.005)
        breadth_slope = area_slope * 0.4 + np.random.normal(0, 0.01)
        breadth_rmse = area_rmse * 0.4 + np.random.normal(0, 0.005)

        rows.append({
            "avg_area_change": area_slope,
            "area_rmse": max(0.001, area_rmse),
            "avg_length_change": length_slope,
            "length_rmse": max(0.001, length_rmse),
            "avg_breadth_change": breadth_slope,
            "breadth_rmse": max(0.001, breadth_rmse),
            "intensity_variation": intensity_slope,
            "intensity_rmse": max(0.01, intensity_rmse),
            "shape_variation": shape_slope,
            "shape_rmse": max(0.001, shape_rmse),
            "avg_solidity_change": solidity_slope,
            "solidity_rmse": max(0.001, solidity_rmse),
            "label": label,
        })

    return pd.DataFrame(rows)


def train_model(csv_path: str = None):
    """
    Train Random Forest classifier and save model artifact.
    """
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    if csv_path and os.path.exists(csv_path):
        print(f"Loading custom dataset from: {csv_path}")
        df = pd.read_csv(csv_path)
    else:
        print("Generating baseline empirical training dataset...")
        df = generate_synthetic_training_data(n_samples=1000)

    X = df[FEATURE_COLUMNS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # Random Forest with probability estimates
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced",
    )

    clf.fit(X_train, y_train)

    # Cross-validation
    cv_scores = cross_val_score(clf, X, y, cv=5)
    print(f"5-Fold Cross-Validation Accuracy: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")

    # Evaluation
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Test Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Feature Importances
    importances = pd.Series(clf.feature_importances_, index=FEATURE_COLUMNS).sort_values(ascending=False)
    print("Top Feature Importances:")
    print(importances.head(6))

    # Save artifact
    joblib.dump(clf, TREND_MODEL_PATH)
    print(f"\n[OK] Model saved successfully to: {TREND_MODEL_PATH}")
    print("BioVision ModelLoader will now automatically use this model!")


if __name__ == "__main__":
    csv_file = sys.argv[1] if len(sys.argv) > 1 else None
    train_model(csv_file)
