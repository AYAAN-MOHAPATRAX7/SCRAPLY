import pytest
from fastapi.testclient import TestClient
from main import app
from buyer.db import init_db, get_db_connection

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_database():
    """Ensure database is freshly initialized before each test."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS claims")
    cursor.execute("DROP TABLE IF EXISTS listings")
    conn.commit()
    conn.close()
    init_db()

# Test 1: Buyer can retrieve available listings
def test_1_buyer_get_available_listings():
    response = client.get("/api/buyer/listings")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    listings = res_json["data"]
    assert isinstance(listings, list)
    assert len(listings) >= 4
    # All returned listings must have status AVAILABLE
    for item in listings:
        assert item["status"] == "AVAILABLE"

# Test 2: Buyer can retrieve listing details
def test_2_buyer_get_listing_details():
    response = client.get("/api/buyer/listings/listing_101")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert data["id"] == "listing_101"
    assert data["food"] == "Fresh Tomatoes"
    assert data["quantity"] == 100.0
    assert data["unit"] == "kg"
    assert data["status"] == "AVAILABLE"

# Test 3 & 4: Buyer can claim available listing and status becomes CLAIMED
def test_3_and_4_buyer_claim_listing_success():
    headers = {"X-User-Role": "BUYER", "X-Buyer-ID": "buyer_test_101"}
    response = client.post("/api/buyer/listings/listing_101/claim", headers=headers)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert data["listing_id"] == "listing_101"
    assert data["status"] == "CLAIMED"
    assert data["buyer_id"] == "buyer_test_101"

    # Verify listing is no longer in available listings
    avail_res = client.get("/api/buyer/listings")
    avail_ids = [item["id"] for item in avail_res.json()["data"]]
    assert "listing_101" not in avail_ids

    # Verify listing details show status CLAIMED
    detail_res = client.get("/api/buyer/listings/listing_101")
    assert detail_res.json()["data"]["status"] == "CLAIMED"
    assert detail_res.json()["data"]["claimed_by"] == "buyer_test_101"

# Test 5: Another buyer cannot claim an already claimed listing
def test_5_cannot_claim_already_claimed_listing():
    # First claim
    client.post("/api/buyer/listings/listing_101/claim", headers={"X-User-Role": "BUYER", "X-Buyer-ID": "buyer_1"})
    
    # Second claim attempt
    response = client.post("/api/buyer/listings/listing_101/claim", headers={"X-User-Role": "BUYER", "X-Buyer-ID": "buyer_2"})
    assert response.status_code == 400
    res_json = response.json()
    assert res_json["success"] is False
    assert res_json["error"]["code"] == "ALREADY_CLAIMED"

# Test 6: Non-buyer cannot use buyer claim endpoint
def test_6_non_buyer_cannot_claim_listing():
    headers = {"X-User-Role": "SELLER", "X-Buyer-ID": "seller_user"}
    response = client.post("/api/buyer/listings/listing_101/claim", headers=headers)
    assert response.status_code == 403
    res_json = response.json()
    assert res_json["success"] is False
    assert res_json["error"]["code"] == "ROLE_RESTRICTED"

# Test 7: Invalid listing ID returns 404 error
def test_7_invalid_listing_returns_404():
    response = client.get("/api/buyer/listings/non_existent_id")
    assert response.status_code == 404
    res_json = response.json()
    assert res_json["success"] is False
    assert res_json["error"]["code"] == "LISTING_NOT_FOUND"

    claim_res = client.post("/api/buyer/listings/non_existent_id/claim", headers={"X-User-Role": "BUYER"})
    assert claim_res.status_code == 404
    assert claim_res.json()["error"]["code"] == "LISTING_NOT_FOUND"

# Test 8: Buyer can retrieve their claims
def test_8_buyer_get_claims():
    buyer_id = "buyer_claims_test"
    headers = {"X-User-Role": "BUYER", "X-Buyer-ID": buyer_id}

    # Claim two listings
    client.post("/api/buyer/listings/listing_101/claim", headers=headers)
    client.post("/api/buyer/listings/listing_102/claim", headers=headers)

    response = client.get(f"/api/buyer/claims?buyer_id={buyer_id}")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    claims = res_json["data"]
    assert len(claims) == 2
    claimed_listing_ids = [c["listing_id"] for c in claims]
    assert "listing_101" in claimed_listing_ids
    assert "listing_102" in claimed_listing_ids

# Test 9: HarvestGuard fields are returned correctly when present
def test_9_harvestguard_fields_returned():
    response = client.get("/api/buyer/listings/listing_101")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["urgency"] == "HIGH"
    assert data["recommended_action"] == "SELL"
    assert data["suggested_price"] == 35.0
    assert data["suggested_discount_percent"] == 12.5
    assert data["confidence"] == 0.88
    assert "reason" in data and len(data["reason"]) > 0

# Test 10: Missing optional HarvestGuard fields do not break the Buyer API
def test_10_missing_optional_harvestguard_fields_handled():
    # Insert a listing with missing optional HarvestGuard fields
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO listings (id, food, quantity, unit, status)
        VALUES ('listing_minimal', 'Basic Wheat', 50.0, 'kg', 'AVAILABLE')
    """)
    conn.commit()
    conn.close()

    # Get listing details
    response = client.get("/api/buyer/listings/listing_minimal")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["id"] == "listing_minimal"
    assert data["food"] == "Basic Wheat"
    assert data["distance_km"] is None
    assert data["harvest_date"] is None
    assert data["expiry_date"] is None
    assert data["suggested_price"] is None

    # Claim the minimal listing
    claim_res = client.post("/api/buyer/listings/listing_minimal/claim", headers={"X-User-Role": "BUYER", "X-Buyer-ID": "buyer_minimal"})
    assert claim_res.status_code == 200
    assert claim_res.json()["data"]["status"] == "CLAIMED"
