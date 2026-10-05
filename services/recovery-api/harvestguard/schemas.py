from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, field_validator

class RecommendedAction(str, Enum):
    SELL = "SELL"
    DISCOUNT = "DISCOUNT"
    STORE = "STORE"
    DONATE = "DONATE"
    PROCESS = "PROCESS"
    RECOVER = "RECOVER"

class UrgencyLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class HarvestGuardAnalysisRequest(BaseModel):
    """Input payload for surplus food analysis."""
    food: Optional[str] = Field(None, description="Name or type of surplus food (e.g., Tomatoes, Rice)")
    quantity: Optional[float] = Field(None, description="Numerical quantity of food")
    unit: Optional[str] = Field(None, description="Unit of measurement (e.g., kg, tonnes, boxes)")
    harvest_date: Optional[str] = Field(None, description="Date when food was harvested (YYYY-MM-DD)")
    production_date: Optional[str] = Field(None, description="Date when food was produced (YYYY-MM-DD)")
    expiry_date: Optional[str] = Field(None, description="Expiration date (YYYY-MM-DD)")
    best_before_date: Optional[str] = Field(None, description="Best before date (YYYY-MM-DD)")
    current_price: Optional[float] = Field(None, description="Current asking or listed price per unit")
    currency: Optional[str] = Field("INR", description="Currency code (e.g., INR, USD)")
    location: Optional[str] = Field(None, description="Origin or storage location (e.g., Chennai, Tamil Nadu)")
    description: Optional[str] = Field(None, description="Free text description or user intention")
    voice_transcript: Optional[str] = Field(None, description="Transcript from voice input if available")
    image_base64: Optional[str] = Field(None, description="Base64 encoded string of food image if provided")
    language: Optional[str] = Field("en", description="Preferred output language code (e.g., en, ta, hi)")

class HarvestGuardAnalysisResponse(BaseModel):
    """Structured output returned by HarvestGuard AI decision support."""
    food: Optional[str] = Field(None, description="Identified or provided food item name")
    quantity: Optional[float] = Field(None, description="Quantity of food")
    unit: Optional[str] = Field(None, description="Unit of quantity")
    recommended_action: RecommendedAction = Field(..., description="Action recommendation: SELL, DISCOUNT, STORE, DONATE, PROCESS, RECOVER")
    urgency: UrgencyLevel = Field(..., description="Urgency classification: LOW, MEDIUM, HIGH, CRITICAL")
    suggested_discount_percent: Optional[float] = Field(None, description="Suggested price discount percentage (0-100) if applicable")
    suggested_price: Optional[float] = Field(None, description="Suggested selling price if applicable")
    currency: Optional[str] = Field("INR", description="Currency code")
    remaining_shelf_life_days: Optional[int] = Field(None, description="Estimated remaining shelf life in days if dates provided")
    reason: str = Field(..., description="Clear, concise explanation for the recommended action")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    missing_information: List[str] = Field(default_factory=list, description="List of missing crucial data fields")
    additional_notes: List[str] = Field(default_factory=list, description="Safety notes, disclaimers, or next step suggestions")

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if v < 0.0 or v > 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")
        return round(v, 2)

class AskHarvestGuardRequest(BaseModel):
    """Input payload for conversational query."""
    query: str = Field(..., description="User's question or message to HarvestGuard")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional food context or current listing state")
    language: Optional[str] = Field("en", description="Preferred output language")

class AskHarvestGuardResponse(BaseModel):
    """Response payload for conversational query."""
    response: str = Field(..., description="HarvestGuard AI concise conversational response")
    language: str = Field("en", description="Response language")
    suggested_actions: List[str] = Field(default_factory=list, description="Follow-up quick action prompts")

class APIErrorDetail(BaseModel):
    code: str
    message: str

class APIResponse(BaseModel):
    """Standard unified API response wrapper."""
    success: bool
    data: Optional[Any] = None
    error: Optional[APIErrorDetail] = None
