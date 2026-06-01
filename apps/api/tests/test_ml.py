from app.services.model_service import model_service
from app.core.config import settings

def test_mock_model_returns_valid_structure():
    # Ensure mock mode is on
    model_service.use_mock = True
    
    text = "This is a completely normal text. It does not have any suspicious phrases."
    result = model_service.predict(text)
    
    assert "prediction" in result
    assert "confidence_score" in result
    assert "risk_level" in result
    assert "explanation" in result
    assert "suspicious_phrases" in result
    
def test_mock_model_detects_suspicious_phrases():
    model_service.use_mock = True
    text = "This shocking secret miracle cure will change your life!"
    result = model_service.predict(text)
    
    assert "shocking" in result["suspicious_phrases"]
    assert "secret" in result["suspicious_phrases"]
    assert "miracle cure" in result["suspicious_phrases"]

def test_mock_model_confidence_bounds():
    model_service.use_mock = True
    text = "Just a test text."
    result = model_service.predict(text)
    
    assert 0.0 <= result["confidence_score"] <= 1.0
