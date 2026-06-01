import os
import argparse
import pandas as pd
import torch
import json
from sklearn.model_selection import train_test_split
from transformers import (
    DistilBertTokenizerFast, 
    DistilBertForSequenceClassification, 
    Trainer, 
    TrainingArguments
)
from datasets import Dataset

# Set a random seed for reproducibility
import random
import numpy as np

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def compute_metrics(eval_pred):
    from sklearn.metrics import accuracy_score, precision_recall_fscore_support
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='binary')
    acc = accuracy_score(labels, predictions)
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def train_model(data_path: str, output_dir: str):
    set_seed(42)
    
    print(f"[*] Loading dataset from {data_path}...")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Please download it and place it there as per docs/MODEL.md")
    
    df = pd.read_csv(data_path)
    
    if 'text' not in df.columns or 'label' not in df.columns:
        raise ValueError("Dataset CSV must contain 'text' and 'label' columns.")
        
    # Clean text slightly (remove NaNs)
    df = df.dropna(subset=['text', 'label'])
    df['text'] = df['text'].astype(str)
    df['label'] = df['label'].astype(int)
    
    print(f"[*] Dataset loaded with {len(df)} samples.")
    
    # Split: 80% Train, 10% Val, 10% Test
    train_texts, temp_texts, train_labels, temp_labels = train_test_split(
        df['text'].tolist(), df['label'].tolist(), test_size=0.2, random_state=42, stratify=df['label']
    )
    
    val_texts, test_texts, val_labels, test_labels = train_test_split(
        temp_texts, temp_labels, test_size=0.5, random_state=42, stratify=temp_labels
    )
    
    print(f"[*] Splits: Train={len(train_texts)}, Val={len(val_texts)}, Test={len(test_texts)}")

    model_name = "distilbert-base-uncased"
    print(f"[*] Initializing Tokenizer: {model_name}")
    tokenizer = DistilBertTokenizerFast.from_pretrained(model_name)
    
    def tokenize_function(texts):
        return tokenizer(texts, padding="max_length", truncation=True, max_length=512)
    
    print("[*] Tokenizing datasets...")
    train_encodings = tokenize_function(train_texts)
    val_encodings = tokenize_function(val_texts)
    
    # Convert to HuggingFace Dataset
    train_dataset = Dataset.from_dict({
        'input_ids': train_encodings['input_ids'],
        'attention_mask': train_encodings['attention_mask'],
        'label': train_labels
    })
    
    val_dataset = Dataset.from_dict({
        'input_ids': val_encodings['input_ids'],
        'attention_mask': val_encodings['attention_mask'],
        'label': val_labels
    })

    print(f"[*] Initializing Model: {model_name}")
    # label2id: fake=0, real=1
    model = DistilBertForSequenceClassification.from_pretrained(
        model_name,
        num_labels=2,
        id2label={0: "fake", 1: "real"},
        label2id={"fake": 0, "real": 1}
    )
    
    # Dynamically select device
    if torch.cuda.is_available():
        device = "cuda"
    elif torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"
        
    print(f"[*] Using device: {device}")
    
    training_args = TrainingArguments(
        output_dir='./results',
        num_train_epochs=3,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=32,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=50,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        use_mps_device=(device == "mps")
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics
    )

    print("[*] Starting training...")
    trainer.train()
    
    print(f"[*] Saving model and tokenizer to {output_dir}")
    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    # Save the test set for the evaluate script
    test_df = pd.DataFrame({'text': test_texts, 'label': test_labels})
    test_csv_path = os.path.join(output_dir, "test_set_split.csv")
    test_df.to_csv(test_csv_path, index=False)
    print(f"[*] Saved test split for evaluation to {test_csv_path}")
    
    print("[*] Training Complete!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="ml/data/dataset.csv", help="Path to the training CSV")
    parser.add_argument("--output", type=str, default="ml/models/fake-news-distilbert", help="Directory to save the trained model")
    args = parser.parse_args()
    
    train_model(args.data, args.output)
