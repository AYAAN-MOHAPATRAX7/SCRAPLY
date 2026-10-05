import logging
from typing import Optional
from fastapi import APIRouter, Header, Query, Path, HTTPException, status
from fastapi.responses import JSONResponse

from buyer.schemas import (
    APIResponse,
    APIErrorDetail,
    FoodListing,
    ClaimResponseData,
    BuyerClaimRecord
)
from buyer.service import BuyerService, BuyerServiceError

logger = logging.getLogger("buyer.router")

router = APIRouter(prefix="/api/buyer", tags=["Buyer"])
service = BuyerService()

def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=APIResponse(
            success=False,
            error=APIErrorDetail(code=code, message=message)
        ).model_dump()
    )

@router.get(
    "/listings",
    response_model=APIResponse,
    summary="Get available food listings for Buyers"
)
async def get_available_listings(
    q: Optional[str] = Query(None, description="Search keyword for food item, location, or reason"),
    urgency: Optional[str] = Query(None, description="Filter by urgency: LOW, MEDIUM, HIGH, CRITICAL"),
    recommended_action: Optional[str] = Query(None, description="Filter by HarvestGuard action: SELL, DISCOUNT, DONATE, PROCESS, etc."),
    sort_by: Optional[str] = Query(None, description="Sort order: urgency, nearest, price_low, latest")
):
    """
    Retrieve food listings that are currently AVAILABLE for claiming.
    """
    try:
        listings = service.get_available_listings(
            query=q,
            urgency=urgency,
            recommended_action=recommended_action,
            sort_by=sort_by
        )
        return JSONResponse(
            status_code=200,
            content=APIResponse(
                success=True,
                data=[listing.model_dump() for listing in listings]
            ).model_dump()
        )
    except Exception as e:
        logger.error(f"Error fetching available listings: {e}", exc_info=True)
        return _error_response(500, "INTERNAL_SERVER_ERROR", "Failed to retrieve food listings.")

@router.get(
    "/listings/{listing_id}",
    response_model=APIResponse,
    summary="Get food listing details by ID"
)
async def get_listing_details(
    listing_id: str = Path(..., description="Unique listing identifier")
):
    """
    Retrieve full details of a specific food listing.
    """
    try:
        listing = service.get_listing_by_id(listing_id)
        return JSONResponse(
            status_code=200,
            content=APIResponse(
                success=True,
                data=listing.model_dump()
            ).model_dump()
        )
    except BuyerServiceError as err:
        return _error_response(err.status_code, err.code, err.message)
    except Exception as e:
        logger.error(f"Error fetching listing details for '{listing_id}': {e}", exc_info=True)
        return _error_response(500, "INTERNAL_SERVER_ERROR", "Failed to retrieve listing details.")

@router.post(
    "/listings/{listing_id}/claim",
    response_model=APIResponse,
    summary="Claim an available food listing"
)
async def claim_listing(
    listing_id: str = Path(..., description="Unique listing identifier"),
    x_user_role: Optional[str] = Header("BUYER", alias="X-User-Role", description="Role header (BUYER required)"),
    x_buyer_id: Optional[str] = Header("buyer_demo", alias="X-Buyer-ID", description="Authenticated Buyer ID"),
    buyer_id_param: Optional[str] = Query(None, alias="buyer_id", description="Optional query parameter override for buyer_id")
):
    """
    Claim an available food listing.
    Transitions listing status from AVAILABLE -> CLAIMED and associates it with the Buyer.
    """
    buyer_id = buyer_id_param or x_buyer_id or "buyer_demo"
    role = x_user_role or "BUYER"

    try:
        claim_result = service.claim_food_listing(
            listing_id=listing_id,
            buyer_id=buyer_id,
            role=role
        )
        return JSONResponse(
            status_code=200,
            content=APIResponse(
                success=True,
                data=claim_result.model_dump()
            ).model_dump()
        )
    except BuyerServiceError as err:
        return _error_response(err.status_code, err.code, err.message)
    except Exception as e:
        logger.error(f"Error claiming listing '{listing_id}': {e}", exc_info=True)
        return _error_response(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred while claiming food.")

@router.get(
    "/claims",
    response_model=APIResponse,
    summary="Get claims for authenticated Buyer"
)
async def get_buyer_claims(
    x_buyer_id: Optional[str] = Header("buyer_demo", alias="X-Buyer-ID"),
    buyer_id_param: Optional[str] = Query(None, alias="buyer_id")
):
    """
    Retrieve all claims made by the authenticated Buyer.
    """
    buyer_id = buyer_id_param or x_buyer_id or "buyer_demo"
    try:
        claims = service.get_buyer_claims(buyer_id=buyer_id)
        return JSONResponse(
            status_code=200,
            content=APIResponse(
                success=True,
                data=[claim.model_dump() for claim in claims]
            ).model_dump()
        )
    except Exception as e:
        logger.error(f"Error retrieving buyer claims: {e}", exc_info=True)
        return _error_response(500, "INTERNAL_SERVER_ERROR", "Failed to retrieve buyer claims.")

@router.get(
    "/claims/{claim_id}",
    response_model=APIResponse,
    summary="Get single claim details"
)
async def get_claim_details(
    claim_id: str = Path(..., description="Claim record ID"),
    x_buyer_id: Optional[str] = Header("buyer_demo", alias="X-Buyer-ID"),
    buyer_id_param: Optional[str] = Query(None, alias="buyer_id")
):
    """
    Retrieve details of a single claim record.
    """
    buyer_id = buyer_id_param or x_buyer_id or "buyer_demo"
    try:
        claim = service.get_claim_by_id(claim_id=claim_id, buyer_id=buyer_id)
        return JSONResponse(
            status_code=200,
            content=APIResponse(
                success=True,
                data=claim.model_dump()
            ).model_dump()
        )
    except BuyerServiceError as err:
        return _error_response(err.status_code, err.code, err.message)
    except Exception as e:
        logger.error(f"Error retrieving claim '{claim_id}': {e}", exc_info=True)
        return _error_response(500, "INTERNAL_SERVER_ERROR", "Failed to retrieve claim details.")
