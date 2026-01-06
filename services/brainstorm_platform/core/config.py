"""
Configuration settings for Brainstorm Platform Service
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_VERSION: str = "v1"
    API_PREFIX: str = f"/api/{API_VERSION}"
    PROJECT_NAME: str = "Brainstorm Platform Service"
    DEBUG: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # Model Paths
    BASE_DIR: Path = Path(__file__).parent.parent.parent.parent
    MODELS_DIR: Path = BASE_DIR / "models" / "brainstorm_platform"
    
    ENTITY_NER_MODEL_PATH: Path = MODELS_DIR / "entity_ner_model"
    ENTITY_REPHRASER_MODEL_PATH: Path = MODELS_DIR / "entity_rephraser_model"
    HESITATION_MODEL_PATH: Path = MODELS_DIR / "hesitation_model" / "hesitation_model .pkl"
    SCALER_PATH: Path = MODELS_DIR / "hesitation_model" / "scaler.pkl"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8004
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
