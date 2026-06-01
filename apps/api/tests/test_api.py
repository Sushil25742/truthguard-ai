def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_admin_route_blocks_without_api_key(client):
    # Access Admin Stats without API Key
    admin_response = client.get("/api/v1/admin/stats")
    assert admin_response.status_code == 403
    assert admin_response.json()["detail"] == "Invalid or missing API Key"

def test_admin_route_allows_with_api_key(client):
    # Access Admin Stats with correct API Key
    admin_response = client.get("/api/v1/admin/stats", headers={"x-api-key": "admin_secret_key"})
    assert admin_response.status_code == 200
    assert "total_predictions" in admin_response.json()
