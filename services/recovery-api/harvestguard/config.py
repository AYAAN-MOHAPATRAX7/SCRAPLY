import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

class Settings:
    """HarvestGuard environment configuration."""
    
    @property
    def GEMMA_API_KEY(self) -> Optional[str]:
        return os.getenv("GEMMA_API_KEY")

    @property
    def GEMMA_MODEL(self) -> str:
        # Default to gemma-4 model, fall back to configured value
        return os.getenv("GEMMA_MODEL", "gemma-4")

    @property
    def HARVESTGUARD_ENV(self) -> str:
        return os.getenv("HARVESTGUARD_ENV", "development")

    @property
    def HARVESTGUARD_PORT(self) -> int:
        return int(os.getenv("HARVESTGUARD_PORT", "8000"))

settings = Settings()
