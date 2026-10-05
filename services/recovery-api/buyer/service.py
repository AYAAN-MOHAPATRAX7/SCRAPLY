import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from buyer.db import get_db_connection, row_to_dict
from buyer.schemas import FoodListing, BuyerClaimRecord, FoodListingStatus, ClaimResponseData

class BuyerServiceError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class BuyerService:
    """Service handling all Buyer domain operations."""

    def get_available_listings(
        self,
        query: Optional[str] = None,
        urgency: Optional[str] = None,
        recommended_action: Optional[str] = None,
        sort_by: Optional[str] = None
    ) -> List[FoodListing]:
        """Fetch food listings that are AVAILABLE for claiming, with optional search and filters."""
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = "SELECT * FROM listings WHERE status = 'AVAILABLE'"
        params: List[Any] = []

        if query:
            sql += " AND (food LIKE ? OR location LIKE ? OR description LIKE ? OR reason LIKE ?)"
            pattern = f"%{query.strip()}%"
            params.extend([pattern, pattern, pattern, pattern])

        if urgency:
            sql += " AND UPPER(urgency) = ?"
            params.append(urgency.strip().upper())

        if recommended_action:
            sql += " AND UPPER(recommended_action) = ?"
            params.append(recommended_action.strip().upper())

        # Sorting logic
        if sort_by == "urgency":
            # Order: CRITICAL > HIGH > MEDIUM > LOW
            sql += """ ORDER BY CASE UPPER(urgency) 
                WHEN 'CRITICAL' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'MEDIUM' THEN 3 
                WHEN 'LOW' THEN 4 
                ELSE 5 END ASC, created_at DESC"""
        elif sort_by == "nearest":
            sql += " ORDER BY CASE WHEN distance_km IS NULL THEN 999999 ELSE distance_km END ASC"
        elif sort_by == "price_low":
            sql += " ORDER BY current_price ASC"
        else:
            # Default sorting: most recently listed
            sql += " ORDER BY created_at DESC"

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        conn.close()

        return [FoodListing(**row_to_dict(r)) for r in rows]

    def get_listing_by_id(self, listing_id: str) -> FoodListing:
        """Fetch details of a single food listing."""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise BuyerServiceError(
                code="LISTING_NOT_FOUND",
                message=f"Food listing with ID '{listing_id}' was not found.",
                status_code=404
            )

        return FoodListing(**row_to_dict(row))

    def claim_food_listing(self, listing_id: str, buyer_id: str, role: str) -> ClaimResponseData:
        """
        Claim an available food listing.
        Enforces:
        - User role must be BUYER
        - Listing exists
        - Listing is currently AVAILABLE
        - Atomic status transition to CLAIMED
        - Record creation in claims table
        """
        # Role Protection
        if not role or role.upper() != "BUYER":
            raise BuyerServiceError(
                code="ROLE_RESTRICTED",
                message="Only authenticated users with the BUYER role are permitted to claim food listings.",
                status_code=403
            )

        conn = get_db_connection()
        cursor = conn.cursor()

        # Step 1: Verify listing exists and get current status
        cursor.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
        listing_row = cursor.fetchone()

        if not listing_row:
            conn.close()
            raise BuyerServiceError(
                code="LISTING_NOT_FOUND",
                message=f"Food listing with ID '{listing_id}' was not found.",
                status_code=404
            )

        current_listing = row_to_dict(listing_row)
        if current_listing["status"] != FoodListingStatus.AVAILABLE.value:
            conn.close()
            raise BuyerServiceError(
                code="ALREADY_CLAIMED",
                message=f"This food listing is no longer available (current status: {current_listing['status']}).",
                status_code=400
            )

        claimed_at = datetime.now(timezone.utc).isoformat()
        claim_id = f"claim_{uuid.uuid4().hex[:8]}"

        # Step 2: Atomic update to prevent race conditions / duplicate claims
        cursor.execute("""
            UPDATE listings 
            SET status = ?, claimed_by = ?, claimed_at = ?
            WHERE id = ? AND status = 'AVAILABLE'
        """, (FoodListingStatus.CLAIMED.value, buyer_id, claimed_at, listing_id))

        if cursor.rowcount == 0:
            conn.close()
            raise BuyerServiceError(
                code="ALREADY_CLAIMED",
                message="This food listing was claimed by another buyer just now.",
                status_code=400
            )

        # Step 3: Insert into claims audit log
        cursor.execute("""
            INSERT INTO claims (id, listing_id, buyer_id, status, claimed_at)
            VALUES (?, ?, ?, ?, ?)
        """, (claim_id, listing_id, buyer_id, FoodListingStatus.CLAIMED.value, claimed_at))

        conn.commit()

        # Fetch updated listing
        cursor.execute("SELECT * FROM listings WHERE id = ?", (listing_id,))
        updated_row = cursor.fetchone()
        conn.close()

        updated_listing = FoodListing(**row_to_dict(updated_row))

        return ClaimResponseData(
            listing_id=listing_id,
            claim_id=claim_id,
            status=FoodListingStatus.CLAIMED,
            buyer_id=buyer_id,
            claimed_at=claimed_at,
            message="Food listing successfully claimed.",
            listing=updated_listing
        )

    def get_buyer_claims(self, buyer_id: str) -> List[BuyerClaimRecord]:
        """Retrieve all claims made by a specific buyer."""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT c.id as claim_id, c.listing_id, c.buyer_id, c.status as claim_status, c.claimed_at,
                   l.*
            FROM claims c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.buyer_id = ?
            ORDER BY c.claimed_at DESC
        """, (buyer_id,))

        rows = cursor.fetchall()
        conn.close()

        records = []
        for r in rows:
            row_dict = row_to_dict(r)
            listing_data = {
                "id": row_dict["id"],
                "food": row_dict["food"],
                "quantity": row_dict["quantity"],
                "unit": row_dict["unit"],
                "location": row_dict["location"],
                "distance_km": row_dict["distance_km"],
                "urgency": row_dict["urgency"],
                "recommended_action": row_dict["recommended_action"],
                "current_price": row_dict["current_price"],
                "suggested_price": row_dict["suggested_price"],
                "currency": row_dict["currency"],
                "suggested_discount_percent": row_dict["suggested_discount_percent"],
                "harvest_date": row_dict["harvest_date"],
                "production_date": row_dict["production_date"],
                "expiry_date": row_dict["expiry_date"],
                "best_before_date": row_dict["best_before_date"],
                "reason": row_dict["reason"],
                "confidence": row_dict["confidence"],
                "remaining_shelf_life_days": row_dict["remaining_shelf_life_days"],
                "status": row_dict["status"],
                "claimed_by": row_dict["claimed_by"],
                "claimed_at": row_dict["claimed_at"],
                "created_at": row_dict["created_at"]
            }
            records.append(
                BuyerClaimRecord(
                    id=row_dict["claim_id"],
                    listing_id=row_dict["listing_id"],
                    buyer_id=row_dict["buyer_id"],
                    status=FoodListingStatus(row_dict["claim_status"]),
                    claimed_at=row_dict["claimed_at"],
                    listing=FoodListing(**listing_data)
                )
            )

        return records

    def get_claim_by_id(self, claim_id: str, buyer_id: str) -> BuyerClaimRecord:
        """Retrieve details of a single claim record."""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT c.id as claim_id, c.listing_id, c.buyer_id, c.status as claim_status, c.claimed_at,
                   l.*
            FROM claims c
            JOIN listings l ON c.listing_id = l.id
            WHERE c.id = ? AND c.buyer_id = ?
        """, (claim_id, buyer_id))

        row = cursor.fetchone()
        conn.close()

        if not row:
            raise BuyerServiceError(
                code="CLAIM_NOT_FOUND",
                message=f"Claim record '{claim_id}' was not found for buyer '{buyer_id}'.",
                status_code=404
            )

        row_dict = row_to_dict(row)
        listing_data = {
            "id": row_dict["id"],
            "food": row_dict["food"],
            "quantity": row_dict["quantity"],
            "unit": row_dict["unit"],
            "location": row_dict["location"],
            "distance_km": row_dict["distance_km"],
            "urgency": row_dict["urgency"],
            "recommended_action": row_dict["recommended_action"],
            "current_price": row_dict["current_price"],
            "suggested_price": row_dict["suggested_price"],
            "currency": row_dict["currency"],
            "suggested_discount_percent": row_dict["suggested_discount_percent"],
            "harvest_date": row_dict["harvest_date"],
            "production_date": row_dict["production_date"],
            "expiry_date": row_dict["expiry_date"],
            "best_before_date": row_dict["best_before_date"],
            "reason": row_dict["reason"],
            "confidence": row_dict["confidence"],
            "remaining_shelf_life_days": row_dict["remaining_shelf_life_days"],
            "status": row_dict["status"],
            "claimed_by": row_dict["claimed_by"],
            "claimed_at": row_dict["claimed_at"],
            "created_at": row_dict["created_at"]
        }

        return BuyerClaimRecord(
            id=row_dict["claim_id"],
            listing_id=row_dict["listing_id"],
            buyer_id=row_dict["buyer_id"],
            status=FoodListingStatus(row_dict["claim_status"]),
            claimed_at=row_dict["claimed_at"],
            listing=FoodListing(**listing_data)
        )
