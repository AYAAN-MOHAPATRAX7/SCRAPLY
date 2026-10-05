import pytest
from harvestguard.service import HarvestGuardService
from harvestguard.schemas import HarvestGuardAnalysisRequest
from harvestguard.gemma_service import GemmaService, GemmaConfigError, GemmaServiceError
from tests.conftest import MockGemmaService

def test_9_missing_api_key_error(client, monkeypatch):
    """
    TEST 9: Missing GEMMA_API_KEY environment variable.
    Expected: Returns clean configuration error with code AI_SERVICE_UNAVAILABLE.
    Does NOT leak raw stack traces or secrets.
    """
    # Unset API key from environment
    monkeypatch.delenv("GEMMA_API_KEY", raising=False)
    
    response = client.post(
        "/api/harvestguard/analyze/json",
        json={"food": "Tomatoes", "quantity": 100}
    )
    
    assert response.status_code == 503
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "AI_SERVICE_UNAVAILABLE"



def test_10_malformed_json_repair_flow():
    """
    TEST 10: Gemma returns malformed response initially, then repaired JSON on retry.
    Expected: Successfully handles repair loop and validates parsed model.
    """
    class MalformedThenRepairedGemma(GemmaService):
        def __init__(self):
            super().__init__(api_key="mock", model_name="gemma-4")
            self.call_count = 0

        def generate_completion(self, system_instruction, user_prompt, image_base64=None, temperature=0.2):
            self.call_count += 1
            if self.call_count == 1:
                # Return malformed JSON
                return "INVALID JSON RESPONSE {{food: Tomatoes"
            else:
                # Repaired valid JSON
                return '{"food": "Tomatoes", "quantity": 100.0, "unit": "kg", "recommended_action": "SELL", "urgency": "HIGH", "reason": "Repaired valid JSON output", "confidence": 0.85, "missing_information": [], "additional_notes": []}'

    gemma_mock = MalformedThenRepairedGemma()
    svc = HarvestGuardService(gemma_service=gemma_mock)
    req = HarvestGuardAnalysisRequest(food="Tomatoes", quantity=100, unit="kg")
    
    result = svc.analyze_surplus_food(req)
    assert gemma_mock.call_count == 2
    assert result.recommended_action.value == "SELL"
    assert result.food == "Tomatoes"


def test_10_unrepairable_malformed_json_raises_clean_error():
    """
    TEST 10 (b): Gemma returns unrepairable garbage text twice.
    Expected: Raises clean GemmaServiceError rather than crashing with unhandled exception.
    """
    class PersistentGarbageGemma(GemmaService):
        def generate_completion(self, system_instruction, user_prompt, image_base64=None, temperature=0.2):
            return "NOT JSON AT ALL"

    svc = HarvestGuardService(gemma_service=PersistentGarbageGemma(api_key="mock"))
    req = HarvestGuardAnalysisRequest(food="Tomatoes")
    
    with pytest.raises(GemmaServiceError) as exc_info:
        svc.analyze_surplus_food(req)
    
    assert "Failed to parse valid structured JSON" in str(exc_info.value)
