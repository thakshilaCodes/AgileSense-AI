"""
Configuration module for Expertise Service.
Follows microservices architecture best practices.
"""
import os
from typing import Optional


class Config:
    """Application configuration loaded from environment variables."""
    
    # MongoDB Configuration
    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        os.getenv("EXPERIENCE_SERVICE_MONGODB_URI", "mongodb://localhost:27017")
    )
    MONGODB_DB_NAME: str = os.getenv(
        "MONGODB_DB_NAME",
        os.getenv("EXPERIENCE_SERVICE_MONGODB_DB_NAME", "agilesense_ai")
    )
    MONGODB_COLLECTION_NAME: str = os.getenv(
        "MONGODB_COLLECTION_NAME",
        "developer_profiles"
    )
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_RELOAD: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    
    # Model Configuration
    MODEL_DIR: str = os.getenv(
        "MODEL_DIR",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "expertise_recommendation"))
    )
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS Configuration
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS",
        "*"
    ).split(",") if os.getenv("CORS_ORIGINS") else ["*"]
    
    # Service Metadata
    SERVICE_NAME: str = "expertise-service"
    SERVICE_VERSION: str = os.getenv("SERVICE_VERSION", "1.0.0")
    
    @classmethod
    def validate(cls) -> None:
        """Validate required configuration."""
        if not cls.MONGODB_URI:
            raise ValueError("MONGODB_URI is required")
        if not cls.MONGODB_DB_NAME:
            raise ValueError("MONGODB_DB_NAME is required")


# Create a singleton instance
config = Config()

