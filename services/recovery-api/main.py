import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from harvestguard.router import router as harvestguard_router
from buyer.router import router as buyer_router
from harvestguard.config import settings

app = FastAPI(
    title="ZeroScraps Platform & HarvestGuard AI Engine",
    description="AI-powered surplus food decision-support system and Buyer marketplace",
    version="1.0.0"
)

# Enable CORS for local development and frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(harvestguard_router)
app.include_router(buyer_router)

# Health Check Route
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "HarvestGuard AI Engine",
        "gemma_model": settings.GEMMA_MODEL,
        "api_key_configured": bool(settings.GEMMA_API_KEY and settings.GEMMA_API_KEY != "your_gemma_api_key_here")
    }

# Mount static frontend interface if static folder exists
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.HARVESTGUARD_PORT, reload=True)
