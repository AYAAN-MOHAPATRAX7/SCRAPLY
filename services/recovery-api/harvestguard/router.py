import base64
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse

from harvestguard.schemas import (
    HarvestGuardAnalysisRequest,
    HarvestGuardAnalysisResponse,
    AskHarvestGuardRequest,
    AskHarvestGuardResponse,
    APIResponse,
    APIErrorDetail
)
from harvestguard.service import HarvestGuardService
from harvestguard.gemma_service import GemmaConfigError, GemmaServiceError

logger = logging.getLogger("harvestguard.router")

router = APIRouter(prefix="/api/harvestguard", tags=["HarvestGuard"])
service = HarvestGuardService()

@router.post(
    "/analyze",
    response_model=APIResponse,
    summary="Analyze surplus food and recommend practical recovery action"
)
async def analyze_surplus_food(
    food: Optional[str] = Form(None),
    quantity: Optional[float] = Form(None),
    unit: Optional[str] = Form(None),
    harvest_date: Optional[str] = Form(None),
    production_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    best_before_date: Optional[str] = Form(None),
    current_price: Optional[float] = Form(None),
    currency: Optional[str] = Form("INR"),
    location: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    voice_transcript: Optional[str] = Form(None),
    language: Optional[str] = Form("en"),
    image: Optional[UploadFile] = File(None)
):
    """
    Form-data endpoint for analyzing surplus food, supporting optional image upload and voice transcript.
    """
    image_b64 = None
    if image:
        try:
            content = await image.read()
            if len(content) > 10 * 1024 * 1024: # 10MB limit
                return JSONResponse(
                    status_code=400,
                    content=APIResponse(
                        success=False,
                        error=APIErrorDetail(
                            code="OVERSIZED_IMAGE",
                            message="Uploaded image exceeds maximum size limit of 10MB."
                        )
                    ).model_dump()
                )
            image_b64 = base64.b64encode(content).decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to read image file: {e}")
            return JSONResponse(
                status_code=400,
                content=APIResponse(
                    success=False,
                    error=APIErrorDetail(
                        code="INVALID_IMAGE",
                        message="Failed to read uploaded image file."
                    )
                ).model_dump()
            )

    request_payload = HarvestGuardAnalysisRequest(
        food=food,
        quantity=quantity,
        unit=unit,
        harvest_date=harvest_date,
        production_date=production_date,
        expiry_date=expiry_date,
        best_before_date=best_before_date,
        current_price=current_price,
        currency=currency,
        location=location,
        description=description,
        voice_transcript=voice_transcript,
        image_base64=image_b64,
        language=language
    )

    return await _process_analysis_request(request_payload)


@router.post(
    "/analyze/json",
    response_model=APIResponse,
    summary="Analyze surplus food using raw JSON payload"
)
async def analyze_surplus_food_json(payload: HarvestGuardAnalysisRequest):
    """
    JSON endpoint for analyzing surplus food.
    """
    return await _process_analysis_request(payload)


async def _process_analysis_request(payload: HarvestGuardAnalysisRequest) -> JSONResponse:
    try:
        result = service.analyze_surplus_food(payload)
        return JSONResponse(
            status_code=200,
            content=APIResponse(success=True, data=result.model_dump()).model_dump()
        )
    except GemmaConfigError as cfg_err:
        logger.warning(f"Gemma Config Error: {cfg_err}")
        return JSONResponse(
            status_code=503,
            content=APIResponse(
                success=False,
                error=APIErrorDetail(
                    code="AI_SERVICE_UNAVAILABLE",
                    message="HarvestGuard Gemma 4 API key is missing or improperly configured."
                )
            ).model_dump()
        )
    except GemmaServiceError as svc_err:
        logger.error(f"Gemma Service Error: {svc_err}")
        return JSONResponse(
            status_code=502,
            content=APIResponse(
                success=False,
                error=APIErrorDetail(
                    code="MODEL_ERROR",
                    message=f"Gemma 4 decision model encountered an issue: {str(svc_err)}"
                )
            ).model_dump()
        )
    except Exception as err:
        logger.error(f"Unexpected Error in HarvestGuard analyze: {err}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content=APIResponse(
                success=False,
                error=APIErrorDetail(
                    code="INTERNAL_SERVER_ERROR",
                    message="An internal error occurred while processing the request."
                )
            ).model_dump()
        )


@router.post(
    "/ask",
    response_model=APIResponse,
    summary="Ask HarvestGuard a conversational question about surplus food"
)
async def ask_harvestguard(payload: AskHarvestGuardRequest):
    """
    Conversational Q&A endpoint.
    """
    if not payload.query or not payload.query.strip():
        return JSONResponse(
            status_code=400,
            content=APIResponse(
                success=False,
                error=APIErrorDetail(
                    code="EMPTY_QUERY",
                    message="Query text cannot be empty."
                )
            ).model_dump()
        )

    try:
        result = service.ask_harvestguard(payload)
        return JSONResponse(
            status_code=200,
            content=APIResponse(success=True, data=result.model_dump()).model_dump()
        )
    except GemmaConfigError as cfg_err:
        return JSONResponse(
            status_code=503,
            content=APIResponse(
                success=False,
                error=APIErrorDetail(
                    code="AI_SERVICE_UNAVAILABLE",
                    message="HarvestGuard Gemma 4 API key is missing or improperly configured."
                )
            ).model_dump()
        )
    except Exception as err:
        logger.error(f"Ask HarvestGuard Error: {err}")
        return JSONResponse(
            status_code=500,
            content=APIResponse(
                success=False,
                error=APIErrorDetail(
                    code="INTERNAL_SERVER_ERROR",
                    message="An error occurred while answering your query."
                )
            ).model_dump()
        )
