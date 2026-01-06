"""
API routes for Brainstorm Platform Service
"""
import logging
from typing import List

from fastapi import APIRouter, HTTPException, status

from ..core.schemas import (
    TextAnalysisRequest,
    RephraseRequest,
    BrainstormAnalysisRequest,
    EntityExtractionResponse,
    HesitationResult,
    RephraseResult,
    ComprehensiveAnalysisResponse,
    HealthResponse
)
from ..inference.entity_extraction import entity_extractor
from ..inference.rephraser import text_rephraser
from ..inference.hesitation_detector import hesitation_detector
from ..inference.model_loader import model_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    models_status = model_manager.get_models_status()
    
    return HealthResponse(
        status="healthy" if all(models_status.values()) else "degraded",
        service="Brainstorm Platform",
        models_loaded=models_status
    )


@router.post("/extract-entities", response_model=EntityExtractionResponse)
async def extract_entities(request: TextAnalysisRequest):
    """
    Extract named entities from brainstorming text
    
    - **text**: The text to analyze for entities
    """
    try:
        entities = entity_extractor.extract_entities(request.text)
        
        return EntityExtractionResponse(
            entities=entities,
            entity_count=len(entities),
            text_length=len(request.text)
        )
    except Exception as e:
        logger.error(f"Entity extraction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Entity extraction failed: {str(e)}"
        )


@router.post("/detect-hesitation", response_model=HesitationResult)
async def detect_hesitation(request: TextAnalysisRequest):
    """
    Detect hesitation patterns in communication
    
    - **text**: The text to analyze for hesitation
    """
    try:
        result = hesitation_detector.detect_hesitation(request.text)
        return result
    except Exception as e:
        logger.error(f"Hesitation detection failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hesitation detection failed: {str(e)}"
        )


@router.post("/rephrase", response_model=RephraseResult)
async def rephrase_text(request: RephraseRequest):
    """
    Rephrase text for improved clarity and inclusivity
    
    - **text**: The text to rephrase
    - **context**: Optional context for better rephrasing
    """
    try:
        result = text_rephraser.rephrase_text(request.text, request.context)
        return result
    except Exception as e:
        logger.error(f"Rephrasing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rephrasing failed: {str(e)}"
        )


@router.post("/analyze", response_model=ComprehensiveAnalysisResponse)
async def comprehensive_analysis(request: BrainstormAnalysisRequest):
    """
    Perform comprehensive analysis of brainstorming contribution
    
    - **text**: The brainstorming text or transcript
    - **participant_id**: Optional participant identifier
    - **session_id**: Optional session identifier
    """
    try:
        # Extract entities
        entities = entity_extractor.extract_entities(request.text)
        
        # Detect hesitation
        hesitation = hesitation_detector.detect_hesitation(request.text)
        
        # Generate rephrased suggestion if high hesitation
        rephrased = None
        if hesitation.hesitation_detected and hesitation.confidence_score > 0.6:
            rephrased = text_rephraser.rephrase_text(request.text)
        
        # Generate recommendations
        recommendations = _generate_recommendations(hesitation, entities)
        
        # Calculate confidence metrics
        confidence_metrics = {
            "hesitation_confidence": hesitation.confidence_score,
            "entity_extraction_confidence": 0.95,  # spaCy is generally reliable
            "overall_analysis_confidence": (hesitation.confidence_score + 0.95) / 2
        }
        
        return ComprehensiveAnalysisResponse(
            original_text=request.text,
            entities=entities,
            hesitation=hesitation,
            rephrased_suggestion=rephrased,
            confidence_metrics=confidence_metrics,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Comprehensive analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


def _generate_recommendations(hesitation: HesitationResult, entities: List) -> List[str]:
    """Generate actionable recommendations based on analysis"""
    recommendations = []
    
    if hesitation.hesitation_detected:
        if hesitation.hesitation_level == "high":
            recommendations.append("Consider rephrasing to sound more confident")
            recommendations.append("Remove filler words and hedging language")
        
        if hesitation.features.get("passive_count", 0) > 2:
            recommendations.append("Use active voice for clearer communication")
        
        if hesitation.features.get("question_marks", 0) > 1:
            recommendations.append("Convert questions to declarative statements when appropriate")
    
    if len(entities) == 0:
        recommendations.append("Add more specific details or examples to your contribution")
    elif len(entities) > 10:
        recommendations.append("Good detail! Consider organizing into key themes")
    
    if not recommendations:
        recommendations.append("Great communication! Clear and confident")
    
    return recommendations
