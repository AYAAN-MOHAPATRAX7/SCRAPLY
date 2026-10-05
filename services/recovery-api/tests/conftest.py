import pytest
from fastapi.testclient import TestClient
from main import app
from harvestguard.gemma_service import GemmaService

@pytest.fixture
def client():
    """FastAPI TestClient instance."""
    return TestClient(app)

class MockGemmaService(GemmaService):
    """
    Mock Gemma Service for deterministic test suite execution without external API dependencies.
    """

    def __init__(self, mock_response_text: str = ""):
        super().__init__(api_key="mock_key", model_name="gemma-4")
        self.mock_response_text = mock_response_text

    def generate_completion(
        self,
        system_instruction: str,
        user_prompt: str,
        image_base64: str = None,
        temperature: float = 0.2
    ) -> str:
        if self.mock_response_text:
            return self.mock_response_text
        return '{"food": "Mock Food", "recommended_action": "SELL", "urgency": "LOW", "reason": "Mock test", "confidence": 0.9, "missing_information": [], "additional_notes": []}'
