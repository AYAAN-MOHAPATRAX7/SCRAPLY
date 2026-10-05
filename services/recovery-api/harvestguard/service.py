import re
import json
import logging
from typing import Dict, Any, Optional
from harvestguard.schemas import (
    HarvestGuardAnalysisRequest,
    HarvestGuardAnalysisResponse,
    AskHarvestGuardRequest,
    AskHarvestGuardResponse,
    RecommendedAction,
    UrgencyLevel
)
from harvestguard.prompts import (
    HARVESTGUARD_SYSTEM_PROMPT,
    CONVERSATIONAL_SYSTEM_PROMPT,
    build_user_analysis_prompt
)
from harvestguard.gemma_service import GemmaService, GemmaConfigError, GemmaServiceError

logger = logging.getLogger("harvestguard.service")

class HarvestGuardService:
    """
    HarvestGuard Core Decision Service.
    
    Orchestrates input normalization, Gemma prompt construction, response schema validation,
    1-step JSON repair loop, and safety disclaimers.
    """

    def __init__(self, gemma_service: Optional[GemmaService] = None):
        self.gemma_service = gemma_service or GemmaService()

    def normalize_input(self, req: HarvestGuardAnalysisRequest) -> Dict[str, Any]:
        """
        Normalizes input data without inventing missing information.
        Standardizes units and extracts key details from voice transcript if needed.
        """
        data = req.model_dump()
        
        # Unit normalization
        if data.get("unit"):
            unit_str = str(data["unit"]).strip().lower()
            unit_map = {
                "kilos": "kg", "kilogram": "kg", "kilograms": "kg", "kgs": "kg",
                "grams": "g", "gram": "g", "gms": "g",
                "tons": "tonnes", "ton": "tonnes", "tonne": "tonnes",
                "liters": "L", "liter": "L", "litres": "L", "litre": "L",
                "boxes": "box", "crates": "crate", "bags": "bag", "quintals": "quintal"
            }
            data["unit"] = unit_map.get(unit_str, unit_str)

        # Voice transcript rule: if voice_transcript is present and description/food is missing, extract context
        if data.get("voice_transcript") and not data.get("description"):
            data["description"] = f"Voice Transcript: {data['voice_transcript']}"

        return data

    def _clean_json_response(self, text: str) -> str:
        """Strips markdown code blocks, backticks, and extra whitespace from model response."""
        text = text.strip()
        # Remove ```json ... ``` or ``` ... ``` wrappers if present
        pattern = r"^```(?:json)?\s*(.*?)\s*```$"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return text

    def analyze_surplus_food(self, request: HarvestGuardAnalysisRequest) -> HarvestGuardAnalysisResponse:
        """
        Analyzes surplus food input and returns structured decision recommendation.
        Includes a 1-step repair loop if initial Gemma JSON is malformed.
        """
        normalized_data = self.normalize_input(request)
        user_prompt = build_user_analysis_prompt(normalized_data)
        image_b64 = normalized_data.get("image_base64")

        # 1. First Gemma call
        raw_response = self.gemma_service.generate_completion(
            system_instruction=HARVESTGUARD_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            image_base64=image_b64,
            temperature=0.2
        )

        cleaned_text = self._clean_json_response(raw_response)

        # 2. Parse & Validate
        try:
            parsed_json = json.loads(cleaned_text)
            response_model = HarvestGuardAnalysisResponse.model_validate(parsed_json)
        except (json.JSONDecodeError, Exception) as val_err:
            logger.warning(f"Initial Gemma response validation failed: {val_err}. Triggering 1-step repair loop.")
            
            # 3. One-step controlled repair retry
            repair_prompt = (
                f"{user_prompt}\n\n"
                f"ATTENTION: Your previous response was invalid JSON or failed schema validation: {str(val_err)}.\n"
                f"Please output ONLY valid raw JSON matching the required schema strictly."
            )
            
            repaired_raw = self.gemma_service.generate_completion(
                system_instruction=HARVESTGUARD_SYSTEM_PROMPT,
                user_prompt=repair_prompt,
                image_base64=image_b64,
                temperature=0.1
            )
            
            repaired_cleaned = self._clean_json_response(repaired_raw)
            try:
                parsed_json = json.loads(repaired_cleaned)
                response_model = HarvestGuardAnalysisResponse.model_validate(parsed_json)
            except Exception as final_err:
                logger.error(f"Gemma repair attempt also failed: {final_err}")
                raise GemmaServiceError(f"Failed to parse valid structured JSON from Gemma response: {str(final_err)}")

        # 4. Enforce Food-Safety Disclaimer Rule for Images
        if image_b64:
            safety_disclaimer = (
                "Food-Safety Note: Visual context from the uploaded image is for item identification only. "
                "Image analysis alone does not certify food safety or edible condition."
            )
            if safety_disclaimer not in response_model.additional_notes:
                response_model.additional_notes.append(safety_disclaimer)

        return response_model

    def ask_harvestguard(self, request: AskHarvestGuardRequest) -> AskHarvestGuardResponse:
        """
        Conversational entrypoint for Q&A with HarvestGuard.
        """
        prompt = f"USER QUERY: {request.query}\nPREFERRED LANGUAGE: {request.language or 'en'}"
        if request.context:
            prompt += f"\nCONTEXT PROVIDED: {json.dumps(request.context)}"

        raw_response = self.gemma_service.generate_completion(
            system_instruction=CONVERSATIONAL_SYSTEM_PROMPT,
            user_prompt=prompt,
            temperature=0.3
        )

        cleaned_text = self._clean_json_response(raw_response)

        try:
            parsed = json.loads(cleaned_text)
            return AskHarvestGuardResponse(
                response=parsed.get("response", cleaned_text),
                language=parsed.get("language", request.language or "en"),
                suggested_actions=parsed.get("suggested_actions", [])
            )
        except Exception:
            # Fallback if non-JSON conversational text returned
            return AskHarvestGuardResponse(
                response=cleaned_text,
                language=request.language or "en",
                suggested_actions=["Analyze surplus food batch", "Ask another question"]
            )
