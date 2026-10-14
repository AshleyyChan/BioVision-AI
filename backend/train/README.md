# BioVision AI · Model Training Guide

This guide explains how to train, evaluate, and deploy Machine Learning and Deep Learning models for the **BioVision / MBSCRL** biological image analysis platform.

---

## 🏗️ Model Architecture Overview

BioVision supports two distinct tiers of models:

| Model Artifact | Type | Target Location | Loaded by | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`trend_model.pkl`** | Scikit-learn (Random Forest / GBDT) | `backend/app/ml/models/trend_model.pkl` | `ModelLoader.load_trend_model()` | Predicts biological stress and tissue phase from longitudinal rate vectors |
| **`segmentation_model.pth`** | PyTorch Deep Learning (U-Net) | `backend/app/ml/models/segmentation_model.pth` | `ModelLoader.load_segmentation_model()` | Deep semantic segmentation of earthworm prostate gland |

> **Note**: If either model file is absent, BioVision **automatically falls back** to deterministic classical algorithms (Adaptive Otsu + Morphological Reconstruction for segmentation, and empirical mathematical instability scoring for trend analysis).

---

## 1️⃣ Training the Trend & Stress Prediction Model (`trend_model.pkl`)

The trend model is trained on multi-day longitudinal morphometric feature vectors.

### Step 1: Prepare Feature Dataset (CSV)
Prepare a CSV file (e.g., `longitudinal_data.csv`) with the following column headers:
```csv
avg_area_change,area_rmse,avg_length_change,length_rmse,avg_breadth_change,breadth_rmse,intensity_variation,intensity_rmse,shape_variation,shape_rmse,avg_solidity_change,solidity_rmse,label
0.21,0.09,0.12,0.04,0.08,0.03,8.5,12.0,0.03,0.09,-0.02,0.04,"Pathological Swelling"
-0.12,0.04,-0.07,0.02,-0.04,0.02,-1.2,4.5,-0.01,0.03,0.01,0.02,"Regenerative Triage"
0.001,0.01,0.002,0.005,0.001,0.004,0.1,1.2,0.001,0.01,0.001,0.01,"Normal / Intact (Stable)"
```

### Step 2: Run the Training Script
```bash
cd backend

# Option A: Train using your own CSV dataset
python train/train_trend_model.py path/to/your/longitudinal_data.csv

# Option B: Train using baseline empirical parameters (auto-generated dataset)
python train/train_trend_model.py
```

### What Happens:
- Trains a Random Forest Classifier with 150 decision trees and balanced class weights.
- Performs 5-fold cross-validation and prints accuracy and classification report.
- Saves the trained model directly to `backend/app/ml/models/trend_model.pkl`.
- `ModelLoader.load_trend_model()` will automatically pick up and serve this model.

---

## 2️⃣ Training the Deep Learning U-Net Segmentation Model (`segmentation_model.pth`)

The segmentation model replaces or augments classical Otsu thresholding with a deep Convolutional Neural Network (U-Net) that directly identifies organ boundaries under difficult microscopy lighting, cell debris, or staining variations.

### Step 1: Install PyTorch
```bash
pip install torch torchvision
```
*(If you have an NVIDIA GPU, install PyTorch with CUDA for fast GPU acceleration).*

### Step 2: Prepare Paired Dataset
Organize your microscopy images and binary masks into the following folder layout:
```
my_dataset/
├── images/
│   ├── specimen_001.png
│   ├── specimen_002.png
│   └── specimen_003.jpg
└── masks/
    ├── specimen_001.png
    ├── specimen_002.png
    └── specimen_003.png
```
- **Images**: High-resolution brightfield or phase-contrast microscopy RGB photos.
- **Masks**: Single-channel grayscale images where **White ($255$)** is the prostate gland and **Black ($0$)** is the background.
- **Annotation Tools**: You can create masks using [ImageJ / Fiji](https://imagej.net/), [LabelMe](https://github.com/wkentaro/labelme), or [CVAT](https://www.cvat.ai/).

### Step 3: Run the U-Net Training Script
```bash
cd backend

# Train on your paired microscopy dataset
python train/train_segmentation_unet.py path/to/my_dataset
```

### What Happens:
- Loads paired images and binary masks.
- Resizes them dynamically to $(512, 512)$ and applies normalization.
- Optimizes using a hybrid **Binary Cross-Entropy (BCE) + Soft Dice Loss** with AdamW optimizer.
- Saves the full PyTorch model directly to `backend/app/ml/models/segmentation_model.pth`.
- Once saved, `ModelLoader.load_segmentation_model()` automatically detects the `.pth` file on the next backend request.

---

## 🔄 Verification & Testing

To verify that both trained models are loaded and functioning:
```bash
cd backend
python -c "from app.ml.model_loader import ModelLoader; print('Trend model:', ModelLoader.load_trend_model()); print('Segmentation model:', ModelLoader.load_segmentation_model())"
```
You should see:
```
[INFO] Trend model loaded successfully
Trend model: RandomForestClassifier(...)
[INFO] Segmentation model loaded successfully
Segmentation model: UNet(...)
```
