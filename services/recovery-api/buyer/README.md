# Buyer Module — ZeroScraps

The **Buyer Module** provides the end-to-end purchasing and food claiming experience for **ZeroScraps**.

> **IMPORTANT INTEGRATION BOUNDARY:**  
> **"Buyer module is responsible for viewing available food and claiming listings. HarvestGuard, NGO, WasteGuard, Transport, and QR functionality are separate modules."**

---

## Core Buyer User Flow

```
AVAILABLE FOOD
      ↓
BUYER VIEWS LISTINGS
      ↓
BUYER OPENS DETAILS (HarvestGuard AI Enriched)
      ↓
BUYER CLICKS [CLAIM]
      ↓
LISTING BECOMES CLAIMED
      ↓
BUYER VIEWS CLAIM STATUS (Under "My Claims")
```

---

## Architecture & Integration

The Buyer module is designed as an isolated, portable Python package:

```
zero-scraps/
├── buyer/
│   ├── __init__.py
│   ├── db.py           # SQLite database engine & seed data
│   ├── schemas.py      # Pydantic data models & status enums
│   ├── service.py      # Buyer domain logic & atomic transaction safety
│   ├── router.py       # FastAPI REST endpoints (/api/buyer)
│   └── README.md       # Integration & API documentation
```

---

## API Endpoints

### 1. Get Available Listings
`GET /api/buyer/listings`

#### Query Parameters:
- `q` (string, optional): Keyword search for food item name, location, or AI reason
- `urgency` (string, optional): Filter by urgency (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `recommended_action` (string, optional): Filter by action (`SELL`, `DISCOUNT`, `DONATE`, `PROCESS`)
- `sort_by` (string, optional): `latest` (default), `urgency`, `nearest`, `price_low`

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "listing_101",
      "food": "Fresh Tomatoes",
      "quantity": 100.0,
      "unit": "kg",
      "location": "Koyambedu Wholesale Market, Chennai",
      "distance_km": 4.2,
      "urgency": "HIGH",
      "recommended_action": "SELL",
      "current_price": 40.0,
      "suggested_price": 35.0,
      "currency": "INR",
      "suggested_discount_percent": 12.5,
      "harvest_date": "2026-10-04",
      "expiry_date": "2026-10-10",
      "reason": "Harvested yesterday and prompt sale maximizes value retention.",
      "confidence": 0.88,
      "remaining_shelf_life_days": 6,
      "status": "AVAILABLE"
    }
  ]
}
```

---

### 2. Get Listing Details
`GET /api/buyer/listings/{listing_id}`

#### Example Response:
```json
{
  "success": true,
  "data": {
    "id": "listing_101",
    "food": "Fresh Tomatoes",
    "quantity": 100.0,
    "unit": "kg",
    "location": "Koyambedu Wholesale Market, Chennai",
    "distance_km": 4.2,
    "urgency": "HIGH",
    "recommended_action": "SELL",
    "current_price": 40.0,
    "suggested_price": 35.0,
    "currency": "INR",
    "suggested_discount_percent": 12.5,
    "status": "AVAILABLE"
  }
}
```

---

### 3. Claim Food Listing
`POST /api/buyer/listings/{listing_id}/claim`

#### Headers:
- `X-User-Role`: `BUYER` (Required for role protection)
- `X-Buyer-ID`: `buyer_demo` (Authenticated Buyer ID)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "listing_id": "listing_101",
    "claim_id": "claim_a1b2c3d4",
    "status": "CLAIMED",
    "buyer_id": "buyer_demo",
    "claimed_at": "2026-10-05T10:30:00Z",
    "message": "Food listing successfully claimed.",
    "listing": {
      "id": "listing_101",
      "status": "CLAIMED",
      "claimed_by": "buyer_demo"
    }
  }
}
```

#### Error Response — Already Claimed (`400 Bad Request`):
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_CLAIMED",
    "message": "This food listing is no longer available."
  }
}
```

#### Error Response — Non-Buyer Role (`403 Forbidden`):
```json
{
  "success": false,
  "error": {
    "code": "ROLE_RESTRICTED",
    "message": "Only authenticated users with the BUYER role are permitted to claim food listings."
  }
}
```

---

### 4. Get Buyer Claims History
`GET /api/buyer/claims`

#### Query Parameters / Headers:
- `buyer_id` or header `X-Buyer-ID`: Authenticated buyer ID

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "claim_a1b2c3d4",
      "listing_id": "listing_101",
      "buyer_id": "buyer_demo",
      "status": "CLAIMED",
      "claimed_at": "2026-10-05T10:30:00Z",
      "listing": {
        "id": "listing_101",
        "food": "Fresh Tomatoes",
        "quantity": 100.0,
        "unit": "kg"
      }
    }
  ]
}
```

---

## Data Model & Database Changes

The Buyer module uses SQLite (`zeroscraps.db`) for lightweight, zero-config persistence:

### `listings` Table:
| Column | Type | Description |
|---|---|---|
| `id` | TEXT (PK) | Unique listing ID |
| `food` | TEXT | Food item name |
| `quantity` | REAL | Numerical quantity |
| `unit` | TEXT | Measurement unit |
| `location` | TEXT | Storage / origin location |
| `distance_km` | REAL | Calculated distance in km (or NULL if uncalculated) |
| `urgency` | TEXT | HarvestGuard urgency rating |
| `recommended_action` | TEXT | HarvestGuard action recommendation |
| `current_price` | REAL | Current listed unit price |
| `suggested_price` | REAL | HarvestGuard suggested unit price |
| `currency` | TEXT | Currency code (default: INR) |
| `suggested_discount_percent` | REAL | HarvestGuard suggested discount % |
| `status` | TEXT | Status: `AVAILABLE`, `CLAIMED`, `PICKUP_PENDING`, `IN_TRANSIT`, `DELIVERED` |
| `claimed_by` | TEXT | Buyer ID who claimed the listing |
| `claimed_at` | TEXT | ISO timestamp when claimed |

### `claims` Table:
| Column | Type | Description |
|---|---|---|
| `id` | TEXT (PK) | Unique claim ID |
| `listing_id` | TEXT (FK) | Reference to `listings(id)` |
| `buyer_id` | TEXT | Claiming Buyer ID |
| `status` | TEXT | Claim status (`CLAIMED`) |
| `claimed_at` | TEXT | ISO timestamp |

---

## How HarvestGuard Data is Consumed

The Buyer module acts strictly as a **consumer** of HarvestGuard AI fields:
- `recommended_action` -> Displayed as recommendation badge on cards & details modal (`SELL`, `DISCOUNT`, `DONATE`, etc.)
- `urgency` -> Displayed as urgency pill (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
- `suggested_price` & `suggested_discount_percent` -> Highlighted on pricing view
- `reason` -> Shown as AI explanation tooltip/box

If optional HarvestGuard fields are missing (e.g. `distance_km` or `harvest_date`), the Buyer UI handles them gracefully without displaying broken or fake values.

---

## How Team Members Can Integrate

1. **Backend Integration**:
   In `main.py`:
   ```python
   from buyer.router import router as buyer_router
   app.include_router(buyer_router)
   ```

2. **Downstream Module Hand-Off (Transport / QR / Delivery)**:
   When the Buyer claims a listing (`status = 'CLAIMED'`), downstream modules (Transport Recommendation, QR Verification) can query:
   ```http
   GET /api/buyer/claims
   ```
   or inspect `listings` with `status = 'CLAIMED'` to trigger transport assignment.

---

## Running Automated Tests

Run the Buyer test suite:
```bash
pytest tests/test_buyer_module.py -v
```

Run all project tests:
```bash
pytest -v
```
