def test_predict_validation(client):
    # Text too short
    response = client.post("/api/v1/predict", json={"text": "Too short"})
    assert response.status_code == 400

def test_predict_structure_and_save(client):
    # Valid prediction request
    text = "This is a completely valid and reasonably long news article text designed to bypass the minimum fifty characters limit."
    response = client.post("/api/v1/predict", json={"text": text})
    
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence_score" in data
    assert "explanation" in data

    # Verify saved to DB by calling history (globally)
    history_response = client.get("/api/v1/predictions")
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert len(history_data) >= 1
    
    # We should find our prediction in the global history
    found = any(item["id"] == data["id"] for item in history_data)
    assert found
