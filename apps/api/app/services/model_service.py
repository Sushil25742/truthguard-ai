import os
import random
import time
from app.core.config import settings

# Attempt to import ML dependencies if available.
# We wrap this in a try-except because in a slim backend environment, 
# PyTorch and Transformers might not be installed if USE_MOCK_MODEL is true.
try:
    import torch
    import torch.nn.functional as F
    from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False


class ModelService:
    def __init__(self):
        self.use_mock = settings.USE_MOCK_MODEL
        self.model_path = settings.MODEL_PATH
        self.tokenizer = None
        self.model = None
        self.device = None
        self.is_loaded = False
        
        self.suspicious_phrases_list = [
            "shocking", "secret", "miracle cure", "government hiding", 
            "breaking truth", "viral claim", "no evidence", "unbelievable", 
            "guaranteed", "conspiracy", "share before deleted", 
            "doctors hate this", "media won't tell you", "media won’t tell you"
        ]

    def _load_real_model(self):
        if self.is_loaded:
            return
            
        if not ML_AVAILABLE:
            raise RuntimeError("PyTorch or Transformers not installed. Cannot run real model mode.")
            
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model path {self.model_path} not found. Please train the model or set USE_MOCK_MODEL=True")
            
        self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(self.model_path)
        self.model = DistilBertForSequenceClassification.from_pretrained(self.model_path)
        self.model.to(self.device)
        self.model.eval()
        self.is_loaded = True

    def _detect_suspicious_phrases(self, text: str) -> list[str]:
        lower_text = text.lower()
        found = []
        for phrase in self.suspicious_phrases_list:
            if phrase in lower_text:
                found.append(phrase)
        return found

    def _generate_explanation(self, prediction: str, confidence: float, suspicious_phrases: list[str]) -> str:
        conf_pct = round(confidence * 100)
        
        if prediction == "Uncertain":
            exp = f"The AI is uncertain about this text ({conf_pct}% confidence). It may contain a mix of verified facts and unverified claims. "
        elif prediction == "Fake":
            exp = f"The AI detected a high probability ({conf_pct}% confidence) that this text is Fake or misinformation. "
        else:
            exp = f"The AI believes this text is Real reporting ({conf_pct}% confidence). "
            
        if suspicious_phrases:
            exp += f"The text contains suspicious patterns often used in clickbait or fake news, such as: {', '.join(suspicious_phrases)}. "
            
        exp += "Please note that AI results should always be manually verified against trusted sources."
        return exp

    def _determine_risk_level(self, prediction: str, confidence: float) -> str:
        if prediction == "Fake" and confidence >= 0.85:
            return "High"
        elif prediction == "Fake" and 0.60 <= confidence < 0.85:
            return "Medium"
        elif prediction == "Uncertain":
            return "Medium"
        else:
            return "Low"

    def predict(self, text: str) -> dict:
        suspicious_phrases = self._detect_suspicious_phrases(text)
        
        if self.use_mock:
            # --- MOCK MODE ---
            time.sleep(1) # Simulate network/processing latency
            
            # Simple mock logic based on suspicious phrases
            if len(suspicious_phrases) > 2:
                fake_prob = random.uniform(0.85, 0.99)
                real_prob = 1.0 - fake_prob
            elif len(suspicious_phrases) > 0:
                fake_prob = random.uniform(0.60, 0.84)
                real_prob = 1.0 - fake_prob
            else:
                real_prob = random.uniform(0.70, 0.99)
                fake_prob = 1.0 - real_prob
                
            model_version = "mock-distilbert-v1"
        else:
            # --- REAL MODE ---
            if not self.is_loaded:
                self._load_real_model()
                
            inputs = self.tokenizer(text, padding="max_length", truncation=True, max_length=512, return_tensors="pt").to(self.device)
            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = F.softmax(outputs.logits, dim=-1)
                
            fake_prob = float(probs[0][0].cpu())
            real_prob = float(probs[0][1].cpu())
            model_version = "distilbert-v1-finetuned"

        # Apply Prediction Rules
        max_confidence = max(fake_prob, real_prob)
        
        if max_confidence < 0.60:
            prediction_label = "Uncertain"
            final_confidence = max_confidence
        elif fake_prob >= 0.60:
            prediction_label = "Fake"
            final_confidence = fake_prob
        else:
            prediction_label = "Real"
            final_confidence = real_prob

        # Calculate Risk and Explanation
        risk_level = self._determine_risk_level(prediction_label, final_confidence)
        explanation = self._generate_explanation(prediction_label, final_confidence, suspicious_phrases)

        return {
            "prediction": prediction_label,
            "confidence_score": final_confidence,
            "risk_level": risk_level,
            "explanation": explanation,
            "suspicious_phrases": suspicious_phrases,
            "model_version": model_version
        }

# Instantiate a singleton service
model_service = ModelService()

def predict_fake_news(text: str) -> dict:
    """Wrapper function to maintain compatibility with existing router."""
    return model_service.predict(text)
