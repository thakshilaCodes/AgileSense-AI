"""
Pydantic schemas for request/response validation
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ============= Request Schemas =============

class TextAnalysisRequest(BaseModel):
    """Request for analyzing communication text"""
    text: str = Field(..., min_length=1, description="Text to analyze")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I think maybe we could potentially try implementing the user authentication feature."
            }
        }


class RephraseRequest(BaseModel):
    """Request for rephrasing text"""
    text: str = Field(..., min_length=1, description="Text to rephrase")
    context: Optional[str] = Field(None, description="Additional context for rephrasing")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I think maybe we could try implementing authentication.",
                "context": "Technical discussion"
            }
        }


class BrainstormAnalysisRequest(BaseModel):
    """Complete brainstorm session analysis"""
    text: str = Field(..., min_length=1, description="Brainstorming text or transcript")
    participant_id: Optional[str] = Field(None, description="ID of participant")
    session_id: Optional[str] = Field(None, description="Brainstorming session ID")


# ============= Response Schemas =============

class EntityResult(BaseModel):
    """Named entity recognition result"""
    text: str
    label: str
    start: int
    end: int


class EntityExtractionResponse(BaseModel):
    """Response for entity extraction"""
    entities: List[EntityResult]
    entity_count: int
    text_length: int


class HesitationResult(BaseModel):
    """Hesitation detection result"""
    hesitation_detected: bool
    confidence_score: float
    hesitation_level: str  # "low", "medium", "high"
    features: Dict[str, Any]


class RephraseResult(BaseModel):
    """Result of text rephrasing"""
    original_text: str
    rephrased_text: str
    improvements: List[str]


class ComprehensiveAnalysisResponse(BaseModel):
    """Complete analysis of brainstorming contribution"""
    original_text: str
    entities: List[EntityResult]
    hesitation: HesitationResult
    rephrased_suggestion: Optional[RephraseResult]
    confidence_metrics: Dict[str, float]
    recommendations: List[str]


# ============= Health Check =============

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    models_loaded: Dict[str, bool]
