# BioVision AI · MBSCRL Research Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![OpenCV](https://img.shields.io/badge/Vision-OpenCV%20%7C%20Scikit--Image-5C3EE8.svg)](https://opencv.org/)
[![Lab](https://img.shields.io/badge/Lab-MBSCRL%20%40%20Sathyabama-0A2540.svg)](https://www.sathyabama.ac.in/)

**BioVision AI** is a biological image analysis platform designed for quantitative, longitudinal assessment of earthworm (*Eudrilus eugeniae* / *Perionyx excavatus*) prostate gland tissue experiments in molecular biology and regenerative medicine.

Developed for the **Molecular Biology and Stem Cell Research Laboratory (MBSCRL)**, Centre for Molecular and Nanomedical Sciences, International Research Centre, **Sathyabama Institute of Science and Technology**.

---

## 🌟 Key Features

1. **Longitudinal Study & Specimen Tracking**:
   - Manage multi-day experimental protocols with chemical concentrations ($H_2O_2$, PBS, herbal formulations), temperature, and exposure periods.
   - Track individual specimen evolution over time with zero data loss.

2. **Automated Quantitative Morphometry & Segmentation**:
   - Fast, reproducible organ segmentation that eliminates manual measurement bias.
   - Computes physical surface area ($mm^2$), length, breadth, circularity, solidity, and shape irregularity.

3. **Multi-Day Trajectory & Trend Modeling**:
   - Analyzes temporal rate of growth/shrinkage, structural deformation, and optical density changes.
   - Automated physiological status classification (*Pathological Swelling*, *Regenerative Triage*, *Degenerative Transformation*, *Stable Maturation*).

4. **Pairwise Image Comparison Tool**:
   - Direct side-by-side comparison of baseline vs. treated images.
   - Calculates percentage delta in geometry, metabolic luminance, and morphology alterations.

---

## 🧠 What AI & ML Models / Algorithms Are Used?

BioVision AI uses a **hybrid Quantitative Computer Vision and Machine Learning architecture**:

### 1. Optical Preprocessing & Illumination Equalization
- **CIELAB Color Space Transformation & CLAHE**:
  $$\text{RGB} \xrightarrow{\mathcal{T}} L^*a^*b^*$$
  Microscopy fields often suffer from vignette glare or non-uniform lamp intensity. CLAHE (Contrast-Limited Adaptive Histogram Equalization with clip limit $2.0$ on an $8\times 8$ grid) is applied exclusively to the luminance ($L^*$) channel, standardizing tissue brightness without shifting color tints.
- **Isotropic Gaussian Filtering**: Reduces high-frequency camera sensor noise.

### 2. Gland Semantic Segmentation
- **Otsu’s Bimodal Adaptive Thresholding**:
  Automatically calculates the optimal separation threshold $t^*$ by maximizing inter-class variance $\sigma_B^2(t)$ between gland tissue and background light.
- **Mathematical Morphology & Topological Hole-Filling**:
  Uses elliptical structuring elements ($9\times 9$) for morphological opening (debris removal) and closing (bridging membrane fissures). An internal contour tree search fills all inner voids and gland lumens to produce a single solid biological mask.
- **Connected Component Extraction**: Isolates the largest connected component as the primary organ region-of-interest (ROI).

### 3. Rotation-Invariant Morphometric Feature Extraction
- **Minimum-Area Bounding Rectangle (`minAreaRect`)**:
  Calculates major and minor axes independent of the microscope slide angle, ensuring rotation-invariant length and breadth metrics.
- **Isoperimetric Quotient (Circularity)**:
  $$\Phi = \frac{4\pi \cdot \text{Area}}{\text{Perimeter}^2}$$
  Measures roundness; deformed tissue yields lower circularity.
- **Solidity & Irregularity**:
  $$\text{Solidity} = \frac{\text{Area}}{\text{Convex Hull Area}}, \quad \text{Shape Irregularity} = 1 - \Phi$$
  A decrease in solidity indicates tissue breakdown or lobular distortion.
- **Metabolic Luminance Statistics**:
  Samples internal tissue pixels after eroding outer boundary margins (to avoid edge shadows) and clipping 5th/95th percentiles (to eliminate microscope reflections).

### 4. Longitudinal Polynomial Regression & Dynamic Rate Modeling
- Fits a first-order polynomial regression ($y = \beta_1 x + \beta_0$) over the temporal timeline.
- Computes both the slope ($\beta_1$, rate of change per day) and the root-mean-square error (RMSE, structural volatility) for each biomarker.

### 5. Multi-Parametric Biological Stress Classification Engine
- Combines trajectory slopes and volatility metrics into a composite instability score:
  $$\text{Instability} = 120(\text{RMSE}_{shape}) + 150(\text{RMSE}_{solidity}) + \frac{\text{RMSE}_{intensity}}{8} + \frac{\text{RMSE}_{area}}{80}$$
- Classifies specimen response into actionable clinical categories:
  - **Pathological Swelling**: Acute enlargement accompanied by structural collapse ($\beta_{area} > 0.15 \land \beta_{solidity} < -0.01$).
  - **Regenerative Triage**: Controlled volumetric reduction with membrane compaction ($\beta_{area} < -0.05 \land \beta_{solidity} > 0.005$).
  - **Degenerative Transformation**: High boundary and structural volatility ($\text{Instability} > 35$).
  - **Standard Maturation / Normal Stable**: Consistent growth or homeostatic stability.

### 6. Extensible Deep Learning Loader (`ModelLoader`)
- A modular architecture with safe, lazy-loading hooks prepared for deep convolutional networks (e.g., PyTorch U-Net for semantic segmentation and Scikit-learn Random Forest/XGBoost for longitudinal stress prediction).

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Launch Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Swagger API Docs: `http://127.0.0.1:8000/docs`

### 2. Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
- Application UI: `http://localhost:5173`

---

## 🏛️ Research Lab & Attribution

**Molecular Biology and Stem Cell Research Laboratory (MBSCRL)**  
Centre for Molecular and Nanomedical Sciences, International Research Centre  
Sathyabama Institute of Science and Technology, Chennai, India  
- **Lead Faculty**: Dr. Chelladurai B. Sakthivel, Dr. Kamaran Rajagopalan, Dr. Jackson Durairaj Selvam Christyraj, Dr. Karthikeyan
