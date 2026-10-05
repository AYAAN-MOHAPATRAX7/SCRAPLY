from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class FoodListingStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    CLAIMED = "CLAIMED"
    PICKUP_PENDING = "PICKUP_PENDING"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class FoodListing(BaseModel):
    """Food listing model consuming HarvestGuard AI enriched data where available."""
    id: str = Field(..., description="Unique listing identifier")
    food: str = Field(..., description="Food item name")
    quantity: float = Field(..., description="Numerical quantity")
    unit: str = Field(..., description="Measurement unit (e.g. kg, boxes)")
    location: Optional[str] = Field(None, description="Location text")
    distance_km: Optional[float] = Field(None, description="Calculated distance in km if available")
    urgency: Optional[str] = Field("MEDIUM", description="HarvestGuard urgency level: LOW, MEDIUM, HIGH, CRITICAL")
    recommended_action: Optional[str] = Field("SELL", description="HarvestGuard recommendation: SELL, DISCOUNT, STORE, DONATE, PROCESS, RECOVER")
    current_price: Optional[float] = Field(None, description="Current price per unit")
    suggested_price: Optional[float] = Field(None, description="HarvestGuard suggested price per unit")
    currency: Optional[str] = Field("INR", description="Currency code")
    suggested_discount_percent: Optional[float] = Field(None, description="HarvestGuard suggested discount %")
    harvest_date: Optional[str] = Field(None, description="Harvest date YYYY-MM-DD")
    production_date: Optional[str] = Field(None, description="Production date YYYY-MM-DD")
    expiry_date: Optional[str] = Field(None, description="Expiry date YYYY-MM-DD")
    best_before_date: Optional[str] = Field(None, description="Best before date YYYY-MM-DD")
    reason: Optional[str] = Field(None, description="HarvestGuard AI recommendation reason")
    confidence: Optional[float] = Field(None, description="HarvestGuard AI confidence score (0.0 - 1.0)")
    remaining_shelf_life_days: Optional[int] = Field(None, description="Estimated remaining shelf life in days")
    status: FoodListingStatus = Field(FoodListingStatus.AVAILABLE, description="Listing status")
    claimed_by: Optional[str] = Field(None, description="Buyer ID who claimed the listing")
    claimed_at: Optional[str] = Field(None, description="Timestamp when claimed")
    created_at: Optional[str] = Field(None, description="Timestamp when created")

class BuyerClaimRecord(BaseModel):
    """Model representing a claim made by a Buyer."""
    id: str = Field(..., description="Unique claim record ID")
    listing_id: str = Field(..., description="ID of the claimed listing")
    buyer_id: str = Field(..., description="ID of the claiming buyer")
    status: FoodListingStatus = Field(FoodListingStatus.CLAIMED, description="Claim status")
    claimed_at: str = Field(..., description="Timestamp of claim")
    listing: Optional[FoodListing] = Field(None, description="Associated listing details")

class ClaimResponseData(BaseModel):
    listing_id: str
    claim_id: str
    status: FoodListingStatus
    buyer_id: str
    claimed_at: str
    message: str
    listing: Optional[FoodListing] = None

class APIErrorDetail(BaseModel):
    code: str
    message: str

class APIResponse(BaseModel):
    """Standard ZeroScraps unified API response wrapper."""
    success: bool
    data: Optional[Any] = None
    error: Optional[APIErrorDetail] = None
