import os
import torch
import torch.nn.functional as F
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

class FakeNewsPredictor:
    def __init__(self, model_path: str = "ml/models/fake-news-distilbert"):
        self.model_path = model_path
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.tokenizer = None
        self.model = None
        self.is_loaded = False
        
    def load(self):
        """Loads the model into memory. Call this once at startup."""
        if self.is_loaded:
            return
            
        print(f"[*] Loading model from {self.model_path} onto {self.device}...")
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model directory {self.model_path} not found.")
            
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(self.model_path)
        self.model = DistilBertForSequenceClassification.from_pretrained(self.model_path)
        self.model.to(self.device)
        self.model.eval()
        self.is_loaded = True
        
    def predict(self, text: str) -> dict:
        """
        Runs inference on a single piece of text.
        Returns probabilities for fake/real and the final prediction.
        """
        if not self.is_loaded:
            self.load()
            
        inputs = self.tokenizer(
            text, 
            padding="max_length", 
            truncation=True, 
            max_length=512, 
            return_tensors="pt"
        ).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = F.softmax(logits, dim=-1)
            
        # Extract probabilities
        fake_prob = float(probs[0][0].cpu())
        real_prob = float(probs[0][1].cpu())
        
        # Determine final prediction
        predicted_class_id = int(torch.argmax(probs, dim=-1)[0].cpu())
        prediction_label = self.model.config.id2label[predicted_class_id] # "fake" or "real"
        
        # Calculate confidence (the probability of the chosen class)
        confidence = max(fake_prob, real_prob)
        
        # Convert to the format expected by the FastAPI backend
        final_prediction = "Fake" if prediction_label == "fake" else "Real"
        
        # Note: 'uncertain' threshold could be applied here if confidence < 0.6 etc.
        if confidence < 0.6:
            final_prediction = "Uncertain"
            risk_level = "Medium"
            explanation = "The model is uncertain. The text contains a mix of real and unverified patterns."
        elif final_prediction == "Fake":
            risk_level = "High"
            explanation = "The AI detected strong linguistic patterns commonly associated with misinformation or clickbait."
        else:
            risk_level = "Low"
            explanation = "The text structure and language align with standard, verifiable reporting."
            
        return {
            "fake_probability": fake_prob,
            "real_probability": real_prob,
            "prediction": final_prediction,
            "confidence": confidence,
            "risk_level": risk_level,
            "explanation": explanation,
            "model_version": "distilbert-v1-finetuned",
            # Suspicious phrases extraction isn't natively handled by sequence classification. 
            # We would need token classification or LIME/SHAP for exact phrases. 
            # Returning empty for now, or you could port the keyword logic here.
            "suspicious_phrases": []
        }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", type=str, required=True, help="Text to classify")
    parser.add_argument("--model", type=str, default="ml/models/fake-news-distilbert", help="Path to model")
    args = parser.parse_args()
    
    predictor = FakeNewsPredictor(model_path=args.model)
    result = predictor.predict(args.text)
    
    import json
    print(json.dumps(result, indent=2))
