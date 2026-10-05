import os
import io
import base64
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger("harvestguard.gemma")

class GemmaConfigError(Exception):
    """Raised when Gemma API key or configuration is missing/invalid."""
    pass

class GemmaServiceError(Exception):
    """Raised when Gemma API call fails due to rate limits, network, or server errors."""
    pass

class GemmaService:
    """
    Gemma 4 Service Abstraction.
    
    Provides a clean, isolated interface for generating structured text and multimodal
    completions using Gemma 4 via official Google GenAI / Gemma API.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        from harvestguard.config import settings
        self.api_key = api_key or settings.GEMMA_API_KEY
        self.model_name = model_name or settings.GEMMA_MODEL

    def _get_client(self):
        if not self.api_key or self.api_key == "your_gemma_api_key_here":
            raise GemmaConfigError("GEMMA_API_KEY environment variable is not configured.")
        
        try:
            from google import genai
            return genai.Client(api_key=self.api_key)
        except ImportError:
            # Fallback for google-generativeai legacy package if installed
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=self.api_key)
                return legacy_genai
            except ImportError:
                raise GemmaServiceError("Google GenAI SDK package (google-genai) is not installed.")

    def generate_completion(
        self,
        system_instruction: str,
        user_prompt: str,
        image_base64: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        """
        Calls Gemma model with system instruction, user prompt, and optional image payload.
        Returns the raw model text response string.
        """
        client = self._get_client()

        try:
            # Detect client SDK type
            if hasattr(client, "models"):
                # Official google-genai SDK (v1.0+)
                from google.genai import types
                
                contents = []
                if image_base64:
                    try:
                        image_bytes = base64.b64decode(image_base64)
                        contents.append(
                            types.Part.from_bytes(
                                data=image_bytes,
                                mime_type="image/jpeg"
                            )
                        )
                    except Exception as e:
                        logger.warning(f"Failed to process image payload: {e}")
                
                contents.append(user_prompt)

                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=temperature,
                    response_mime_type="application/json"
                )

                response = client.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=config
                )

                if not response or not response.text:
                    raise GemmaServiceError("Gemma returned an empty response.")
                
                return response.text

            else:
                # Legacy google-generativeai fallback
                model = client.GenerativeModel(
                    model_name=self.model_name,
                    system_instruction=system_instruction
                )
                
                parts = []
                if image_base64:
                    try:
                        from PIL import Image
                        image_bytes = base64.b64decode(image_base64)
                        img = Image.open(io.BytesIO(image_bytes))
                        parts.append(img)
                    except Exception as e:
                        logger.warning(f"Failed to load image in legacy mode: {e}")

                parts.append(user_prompt)

                response = model.generate_content(
                    parts,
                    generation_config={"temperature": temperature}
                )

                if not response or not response.text:
                    raise GemmaServiceError("Gemma returned an empty response.")
                
                return response.text

        except (GemmaConfigError, GemmaServiceError):
            raise
        except Exception as e:
            logger.error(f"Gemma API Execution Error: {str(e)}", exc_info=True)
            raise GemmaServiceError(f"Gemma API completion failed: {str(e)}")
