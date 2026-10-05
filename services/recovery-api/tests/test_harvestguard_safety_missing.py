import json
import pytest
from harvestguard.service import HarvestGuardService
from harvestguard.schemas import HarvestGuardAnalysisRequest
from tests.conftest import MockGemmaService

def test_7_vague_input_missing_information_identification():
    """
    TEST 7: User provides vague input "I have some vegetables".
    Expected: Does NOT invent quantity, price, expiry date, or location.
    Must identify missing information in missing_information list.
    """
    mock_resp = json.dumps({
        "food": "Vegetables",
        "quantity": None,
        "unit": None,
        "recommended_action": "SELL",
        "urgency": "MEDIUM",
        "suggested_discount_percent": None,
        "suggested_price": None,
        "currency": "INR",
        "remaining_shelf_life_days": None,
        "reason": "Vegetables are generally sellable, but insufficient details were provided.",
        "confidence": 0.50,
        "missing_information": [
            "Exact vegetable type",
            "Quantity and unit of measurement",
            "Harvest or expiration date",
            "Current price",
            "Storage location"
        ],
        "additional_notes": []
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        description="I have some vegetables."
    )
    
    result = svc.analyze_surplus_food(req)
    assert result.quantity is None
    assert result.suggested_price is None
    assert result.remaining_shelf_life_days is None
    assert len(result.missing_information) > 0
    assert any("Quantity" in info or "quantity" in info.lower() for info in result.missing_information)


def test_8_image_input_food_safety_rule():
    """
    TEST 8: Image-only input provided.
    Expected: Does NOT claim image proves food safety or spoilage.
    Enforces visual context note and food-safety disclaimer in additional_notes.
    """
    mock_resp = json.dumps({
        "food": "Apples",
        "quantity": None,
        "unit": None,
        "recommended_action": "SELL",
        "urgency": "MEDIUM",
        "suggested_discount_percent": None,
        "suggested_price": None,
        "currency": "INR",
        "remaining_shelf_life_days": None,
        "reason": "Visual context indicates apples, but physical safety inspection is required.",
        "confidence": 0.70,
        "missing_information": ["Quantity", "Harvest Date", "Price"],
        "additional_notes": []
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        image_base64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    )
    
    result = svc.analyze_surplus_food(req)
    assert len(result.additional_notes) > 0
    assert any("does not certify food safety" in note.lower() or "safety" in note.lower() for note in result.additional_notes)
