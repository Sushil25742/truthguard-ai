# TruthGuard AI: Machine Learning Pipeline

This document explains how to prepare your dataset, train the `distilbert-base-uncased` model for fake news detection, and evaluate it using either your local machine or Google Colab.

## 1. Dataset Preparation

We recommend using the **Real and Fake News Dataset** (from Kaggle) or the **IEEE DataPort Fake News Dataset**. 

Your final dataset **must** be a CSV file with exactly two columns:
1. `text`: The raw text of the news article.
2. `label`: An integer where `0` = Fake News, and `1` = Real News.

### Formatting the Dataset (Example script)
If your dataset is split into `Fake.csv` and `True.csv` (common for the Kaggle dataset), you can merge them like this:

```python
import pandas as pd

fake_df = pd.read_csv("Fake.csv")
real_df = pd.read_csv("True.csv")

fake_df['label'] = 0
real_df['label'] = 1

# Merge and shuffle
df = pd.concat([fake_df, real_df]).sample(frac=1).reset_index(drop=True)

# Save only required columns
df[['text', 'label']].to_csv("dataset.csv", index=False)
```

Save your formatted dataset to `ml/data/dataset.csv`. **Do not commit this file to GitHub.**

---

## 2. Training on Google Colab (Recommended for Free Tier)

Training Transformers locally can be slow without an Apple Silicon Mac or an NVIDIA GPU. Google Colab offers free T4 GPUs.

1. Go to [Google Colab](https://colab.research.google.com/).
2. Create a **New Notebook**.
3. Go to `Runtime > Change runtime type` and select **T4 GPU**.
4. Run the following cells in order:

### Cell 1: Install Dependencies
```bash
!pip install torch transformers datasets pandas scikit-learn tqdm
```

### Cell 2: Upload Files
Upload your `dataset.csv` and the Python scripts from your `ml/training` folder using the Colab file explorer (on the left panel).

### Cell 3: Run Training
```bash
!python train.py --data dataset.csv --output fake-news-distilbert
```

### Cell 4: Evaluate
```bash
!python evaluate.py --model fake-news-distilbert --test-data fake-news-distilbert/test_set_split.csv
```

### Cell 5: Download the Model
Zip the output folder and download it to your local machine:
```bash
!zip -r fake-news-distilbert.zip fake-news-distilbert/
```
Extract it into your local repository at `ml/models/fake-news-distilbert/`. **Do not commit these files to GitHub.**

---

## 3. Training Locally (Mac / PC)

If you have a powerful local machine (e.g., M1/M2/M3 Mac, or PC with RTX GPU), the script will automatically utilize `mps` or `cuda`.

1. Ensure you have installed the requirements:
   ```bash
   cd ml
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements-ml.txt
   ```
2. Place `dataset.csv` in `ml/data/`.
3. Run the training script:
   ```bash
   python training/train.py --data data/dataset.csv --output models/fake-news-distilbert
   ```
4. Run the evaluation script:
   ```bash
   python training/evaluate.py --model models/fake-news-distilbert --test-data models/fake-news-distilbert/test_set_split.csv
   ```

---

## 4. Inference Integration

Once the model is placed in `ml/models/fake-news-distilbert`, you can use the predictor class in your FastAPI backend or anywhere else:

```python
from ml.inference.predict import FakeNewsPredictor

predictor = FakeNewsPredictor(model_path="ml/models/fake-news-distilbert")
result = predictor.predict("Breaking: Aliens have landed in New York!")

print(result)
# Output includes: fake_probability, real_probability, prediction, confidence, risk_level
```
