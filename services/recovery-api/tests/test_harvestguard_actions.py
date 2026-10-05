import json
import pytest
from harvestguard.service import HarvestGuardService
from harvestguard.schemas import HarvestGuardAnalysisRequest, RecommendedAction, UrgencyLevel
from tests.conftest import MockGemmaService

def test_1_sell_action_fresh_tomatoes():
    """
    TEST 1: 100 kg tomatoes harvested yesterday, user wants to sell quickly.
    Expected: Recommended action is SELL or DISCOUNT. Must not automatically recommend disposal.
    """
    mock_resp = json.dumps({
        "food": "Tomatoes",
        "quantity": 100.0,
        "unit": "kg",
        "recommended_action": "SELL",
        "urgency": "HIGH",
        "suggested_discount_percent": None,
        "suggested_price": 40.0,
        "currency": "INR",
        "remaining_shelf_life_days": 5,
        "reason": "The tomatoes were harvested recently and the user wants to sell them quickly.",
        "confidence": 0.92,
        "missing_information": [],
        "additional_notes": ["Sell promptly in local market."]
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        food="Tomatoes",
        quantity=100,
        unit="kg",
        harvest_date="2026-10-03",
        current_price=40,
        currency="INR",
        location="Chennai",
        description="Harvested yesterday, need to sell quickly"
    )
    
    result = svc.analyze_surplus_food(req)
    assert result.recommended_action in [RecommendedAction.SELL, RecommendedAction.DISCOUNT]
    assert result.food == "Tomatoes"
    assert result.quantity == 100.0
    assert result.urgency in [UrgencyLevel.HIGH, UrgencyLevel.CRITICAL, UrgencyLevel.MEDIUM]


def test_2_discount_action_slow_demand_rice():
    """
    TEST 2: 10 kg rice with 15 days remaining, Rs 600, slow demand.
    Expected: DISCOUNT recommendation is returned.
    """
    mock_resp = json.dumps({
        "food": "Basmati Rice",
        "quantity": 10.0,
        "unit": "kg",
        "recommended_action": "DISCOUNT",
        "urgency": "MEDIUM",
        "suggested_discount_percent": 15.0,
        "suggested_price": 510.0,
        "currency": "INR",
        "remaining_shelf_life_days": 15,
        "reason": "Demand is slow and 15 days remain, so offering a modest discount accelerates sale.",
        "confidence": 0.88,
        "missing_information": [],
        "additional_notes": []
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        food="Basmati Rice",
        quantity=10,
        unit="kg",
        expiry_date="2026-10-19",
        current_price=600,
        description="Demand is slow this week"
    )
    
    result = svc.analyze_surplus_food(req)
    assert result.recommended_action == RecommendedAction.DISCOUNT
    assert result.suggested_discount_percent == 15.0


def test_3_store_action_cold_storage():
    """
    TEST 3: Food with suitable storage, no immediate buyer, sufficient remaining shelf life.
    Expected: STORE recommendation is returned.
    """
    mock_resp = json.dumps({
        "food": "Potatoes",
        "quantity": 500.0,
        "unit": "kg",
        "recommended_action": "STORE",
        "urgency": "LOW",
        "suggested_discount_percent": None,
        "suggested_price": None,
        "currency": "INR",
        "remaining_shelf_life_days": 60,
        "reason": "Suitable cold storage facility is available and food has ample remaining shelf life.",
        "confidence": 0.90,
        "missing_information": [],
        "additional_notes": ["Maintain cold storage temperature between 4-7 C."]
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        food="Potatoes",
        quantity=500,
        unit="kg",
        description="Cold storage available on site, no buyer today"
    )
    
    result = svc.analyze_surplus_food(req)
    assert result.recommended_action == RecommendedAction.STORE
    assert result.urgency == UrgencyLevel.LOW


def test_4_donate_action_surplus_cooked_meals():
    """
    TEST 4: Suitable surplus food with a suitable donation pathway available.
    Expected: DONATE recommendation is returned.
    """
    mock_resp = json.dumps({
        "food": "Cooked Catering Meals",
        "quantity": 40.0,
        "unit": "boxes",
        "recommended_action": "DONATE",
        "urgency": "HIGH",
        "suggested_discount_percent": None,
        "suggested_price": None,
        "currency": "INR",
        "remaining_shelf_life_days": 0,
        "reason": "Fresh prepared surplus meals are ready for immediate donation to local community shelter.",
        "confidence": 0.95,
        "missing_information": [],
        "additional_notes": ["Transport in temperature-controlled food warmers."]
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        food="Cooked Catering Meals",
        quantity=40,
        unit="boxes",
        description="Surplus event catering, free for immediate donation to shelter"
    )
    
    result = svc.analyze_surplus_food(req)
    assert result.recommended_action == RecommendedAction.DONATE


def test_5_process_action_overripe_fruits():
    """
    TEST 5: Food suitable for another processing pathway (e.g. jam, sauce, drying).
    Expected: PROCESS recommendation is returned.
    """
    mock_resp = json.dumps({
        "food": "Overripe Strawberries",
        "quantity": 80.0,
        "unit": "kg",
        "recommended_action": "PROCESS",
        "urgency": "MEDIUM",
        "suggested_discount_percent": None,
        "suggested_price": None,
        "currency": "INR",
        "remaining_shelf_life_days": 2,
        "reason": "Fruit is too soft for retail display but ideal for processing into fruit jam or puree.",
        "confidence": 0.91,
        "missing_information": [],
        "additional_notes": ["Send directly to fruit processing facility."]
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        food="Overripe Strawberries",
        quantity=80,
        unit="kg",
        description="Soft strawberries, suitable for jam manufacturing"
    )
    
    result = svc.analyze_surplus_food(req)
    assert result.recommended_action == RecommendedAction.PROCESS


def test_6_recover_action_non_edible_scraps():
    """
    TEST 6: Food unsuitable for original intended use but suitable recovery pathway exists (animal feed/compost).
    Expected: RECOVER recommendation is returned.
    """
    mock_resp = json.dumps({
        "food": "Vegetable Market Scraps",
        "quantity": 200.0,
        "unit": "kg",
        "recommended_action": "RECOVER",
        "urgency": "LOW",
        "suggested_discount_percent": None,
        "suggested_price": None,
        "currency": "INR",
        "remaining_shelf_life_days": 0,
        "reason": "Non-edible market trimmings can be recovered for livestock feed or bio-composting.",
        "confidence": 0.89,
        "missing_information": [],
        "additional_notes": ["Route to local organic composting site."]
    })
    
    svc = HarvestGuardService(gemma_service=MockGemmaService(mock_resp))
    req = HarvestGuardAnalysisRequest(
        food="Vegetable Market Scraps",
        quantity=200,
        unit="kg",
        description="Non-edible sorting trimmings"
    )
    
    result = svc.analyze_surplus_food(req)
    assert result.recommended_action == RecommendedAction.RECOVER
