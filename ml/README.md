# TruthGuard AI ML Pipeline (Free Tier)

This directory contains instructions and resources for training the `DistilBERT` model used by TruthGuard AI.

## Training with Google Colab (Free GPUs)

To avoid local compute costs, we recommend training the model using Google Colab's free T4 GPU tier.

1. **Upload Dataset:** Download the ISOT Fake News Dataset (or similar) from Kaggle.
2. **Open Colab:** Go to [Google Colab](https://colab.research.google.com/) and create a new notebook.
3. **Change Runtime:** Go to `Runtime > Change runtime type` and select `T4 GPU`.
4. **Copy the Script below** into your notebook:

```python
!pip install transformers torch datasets evaluate scikit-learn

import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments

# 1. Load Data
# Assuming you uploaded 'news.csv' with columns: 'text', 'label' (0=Real, 1=Fake)
df = pd.read_csv('news.csv').sample(n=10000) # Subset for speed
dataset = Dataset.from_pandas(df)
dataset = dataset.train_test_split(test_size=0.2)

# 2. Tokenize
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
def tokenize(batch):
    return tokenizer(batch["text"], padding=True, truncation=True, max_length=512)
encoded_dataset = dataset.map(tokenize, batched=True)

# 3. Model
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)

# 4. Train
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset["train"],
    eval_dataset=encoded_dataset["test"],
)

trainer.train()

# 5. Export
model.save_pretrained("./truthguard_distilbert")
tokenizer.save_pretrained("./truthguard_distilbert")
```

5. **Download the Model:** After training, zip the `./truthguard_distilbert` folder and download it.
6. **Local Integration:** Extract it into the `backend/models/` folder. The FastAPI backend will load it if `USE_MOCK_MODEL=false`.
