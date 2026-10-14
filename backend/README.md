# BioVision Backend · MBSCRL Research Platform

Backend services for quantitative biological image analysis and longitudinal tracking of earthworm (*Eudrilus eugeniae* / *Perionyx excavatus*) prostate gland tissue experiments, developed for the **Molecular Biology & Stem Cell Research Laboratory (MBSCRL)**, Sathyabama Institute of Science and Technology.

---

## Architecture Overview

```
backend/
├── app/
│   ├── api/             # FastAPI REST endpoints
│   │   ├── analyze.py   # Single-day & multi-day analytical endpoints
│   │   ├── compare.py   # Standalone image-to-image comparison endpoint
│   │   ├── day.py       # Day lifecycle & parameters
│   │   ├── specimen.py  # Specimen management
│   │   ├── study.py     # Study management
│   │   ├── upload.py    # Specimen image uploads
│   │   └── image_compare_upload.py
│   ├── core/            # Configuration and logging
│   ├── ml/              # Computer Vision, Morphometry & ML algorithms
│   │   ├── preprocessing.py      # LAB CLAHE & Gaussian denoising
│   │   ├── segmentation.py       # Otsu + morphological closing & hole-filling
│   │   ├── feature_extraction.py # Morphological & optical feature extraction
│   │   ├── trend_analysis.py     # Polynomial regression trend modeling
│   │   └── model_loader.py       # Extensible Deep Learning loader (PyTorch/Joblib)
│   ├── services/        # Business logic & data orchestration
│   └── utils/           # Validation and IO utilities
├── storage/             # File-backed storage (studies, uploads, results)
└── requirements.txt
```

---

## AI, ML & Computer Vision Models Used

The platform utilizes a **hybrid Machine Learning and Quantitative Computer Vision Engine**:

1. **Adaptive Contrast Normalization (L*a*b* CLAHE)**:
   - Converts microscopy images to the CIELAB color space.
   - Applies Contrast-Limited Adaptive Histogram Equalization (clip limit = 2.0, tile grid = 8×8) specifically to the luminance ($L^*$) channel. This eliminates non-uniform microscope lighting without distorting tissue chrominance.

2. **Semantic Tissue Segmentation (Adaptive Otsu + Morphological Reconstruction)**:
   - Evaluates intra-class variance clustering on grayscale histograms to adaptively segment foreground gland tissue from microscopic slide illumination.
   - Applies elliptical morphological opening and high-iteration morphological closing ($\text{kernel} = 9\times 9$) followed by topological hole-filling through contour hierarchy analysis.
   - Identifies the primary organ through Connected Component Analysis ($C_{max} = \arg\max \text{Area}(C_i)$).

3. **Rotation-Invariant Geometric Morphometry**:
   - Computes minimum area rotated bounding rectangles (`minAreaRect`) to determine major axis length and minor axis breadth independent of specimen orientation.
   - Calculates calibrated physical surface area ($A_{mm^2} = A_{px} \times r^2$).
   - Calculates isoperimetric circularity quotient ($\Phi = \frac{4\pi A}{P^2}$), convex hull area, solidity ($S = \frac{A}{A_{hull}}$), and shape irregularity index ($I = 1 - \Phi$).

4. **Metabolic & Inflammation Feature Extraction**:
   - Applies ROI mask erosion ($\text{kernel} = 3\times 3$) to eliminate boundary edge shadows.
   - Clips 5th and 95th percentiles to mitigate specular glare and reflection artifacts.
   - Calculates normalized mean optical density and texture standard deviation ($\sigma$).

5. **Longitudinal Trend Modeling & Trajectory Fitting**:
   - Uses first-order polynomial regression ($y = mx + b$) over the chronological time-series to determine dynamic rates of change ($\frac{\Delta A}{\Delta t}$, $\frac{\Delta L}{\Delta t}$, $\frac{\Delta S}{\Delta t}$, $\frac{\Delta I}{\Delta t}$).
   - Computes residual root-mean-square error (RMSE) variability to capture biological instability.

6. **Empirical Multi-Parametric Stress Classification Model**:
   - Formulates a composite physiological instability index:
     $$\text{Instability} = 120(\text{RMSE}_{shape}) + 150(\text{RMSE}_{solidity}) + \frac{\text{RMSE}_{intensity}}{8} + \frac{\text{RMSE}_{area}}{80}$$
   - Incorporates trend shifts ($\text{TrendFactor} = \max(0, 10\beta_{area}) + \max(0, -30\beta_{solidity}) + \max(0, 40\beta_{shape})$) to stratify health status:
     - **Pathological Swelling** ($\beta_{area} > 0.15 \land \beta_{solidity} < -0.01$)
     - **Regenerative Triage** ($\beta_{area} < -0.05 \land \beta_{solidity} > 0.005$)
     - **Degenerative Transformation** ($\text{Instability} > 35$)
     - **Standard Maturation** / **Normal Stable**

7. **Extensible Deep Learning Architecture (`ModelLoader`)**:
   - Built-in hook designed for plug-and-play PyTorch U-Net models (`segmentation_model.pth`) and Scikit-learn/Joblib regressors (`trend_model.pkl`), ensuring seamless scalability from classical CV to deep neural networks.

---

## Installation & Running

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.
