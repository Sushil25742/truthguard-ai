import os
import argparse
import pandas as pd
import json
import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from sklearn.metrics import (
    accuracy_score, 
    precision_recall_fscore_support, 
    confusion_matrix, 
    classification_report
)

def evaluate_model(model_path: str, test_data_path: str):
    print(f"[*] Loading model and tokenizer from {model_path}...")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Please train it first.")
        
    tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
    model = DistilBertForSequenceClassification.from_pretrained(model_path)
    
    if torch.cuda.is_available():
        device = "cuda"
    elif torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"
        
    model.to(device)
    model.eval()
    
    print(f"[*] Loading test dataset from {test_data_path}...")
    if not os.path.exists(test_data_path):
        raise FileNotFoundError(f"Test data not found at {test_data_path}.")
        
    df = pd.read_csv(test_data_path)
    df = df.dropna(subset=['text', 'label'])
    texts = df['text'].astype(str).tolist()
    labels = df['label'].astype(int).tolist()
    
    print(f"[*] Evaluating {len(texts)} samples on {device}...")
    
    predictions = []
    
    # Evaluate in batches to avoid OOM
    batch_size = 32
    with torch.no_grad():
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            inputs = tokenizer(batch_texts, padding="max_length", truncation=True, max_length=512, return_tensors="pt").to(device)
            outputs = model(**inputs)
            logits = outputs.logits
            batch_preds = torch.argmax(logits, dim=-1).cpu().numpy().tolist()
            predictions.extend(batch_preds)
            
            if i % (batch_size * 10) == 0:
                print(f"    Progress: {i}/{len(texts)}")
                
    print("\n[*] Calculating metrics...")
    
    acc = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='binary')
    cm = confusion_matrix(labels, predictions)
    report = classification_report(labels, predictions, target_names=["fake", "real"], output_dict=True)
    
    metrics = {
        "accuracy": float(acc),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "confusion_matrix": cm.tolist(),
        "classification_report": report
    }
    
    print("\n=== Evaluation Results ===")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("\nConfusion Matrix:")
    print("                 Predicted Fake | Predicted Real")
    print(f"Actual Fake    | {cm[0][0]:<14} | {cm[0][1]}")
    print(f"Actual Real    | {cm[1][0]:<14} | {cm[1][1]}")
    
    output_report_path = os.path.join(model_path, "evaluation_report.json")
    with open(output_report_path, "w") as f:
        json.dump(metrics, f, indent=4)
        
    print(f"\n[*] Evaluation report saved to {output_report_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="ml/models/fake-news-distilbert", help="Path to the trained model")
    parser.add_argument("--test-data", type=str, default="ml/models/fake-news-distilbert/test_set_split.csv", help="Path to the test CSV")
    args = parser.parse_args()
    
    evaluate_model(args.model, args.test_data)
