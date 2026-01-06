"""
Hesitation detection using trained ML model
"""
import logging
import re
import numpy as np
from typing import Dict, Any

from ..core.schemas import HesitationResult
from .model_loader import model_manager

logger = logging.getLogger(__name__)


class HesitationDetector:
    """Detect hesitation patterns in communication"""
    
    def __init__(self):
        self.model = model_manager.hesitation_model
        self.scaler = model_manager.scaler
        
        # Hesitation indicators
        self.hesitation_words = [
            "uh", "um", "er", "ah", "hmm", "well", "like", "you know",
            "i mean", "sort of", "kind of", "maybe", "perhaps",
            "possibly", "probably", "i think", "i guess", "i suppose"
        ]
        
        self.filler_patterns = [
            r'\b(uh+|um+|er+|ah+)\b',
            r'\b(hmm+|huh+)\b',
            r'\.\.\.',
            r'--'
        ]
    
    def extract_features(self, text: str) -> np.ndarray:
        """
        Extract features from text for hesitation detection
        
        Args:
            text: Input text to analyze
            
        Returns:
            Feature vector as numpy array
        """
        text_lower = text.lower()
        words = text.split()
        
        # Feature 1: Hesitation word count
        hesitation_count = sum(1 for word in self.hesitation_words if word in text_lower)
        
        # Feature 2: Filler word ratio
        filler_count = sum(len(re.findall(pattern, text_lower)) for pattern in self.filler_patterns)
        filler_ratio = filler_count / len(words) if words else 0
        
        # Feature 3: Average word length (shorter words may indicate hesitation)
        avg_word_length = np.mean([len(w) for w in words]) if words else 0
        
        # Feature 4: Sentence fragment count (incomplete thoughts)
        sentence_fragments = text.count('...') + text.count('--')
        
        # Feature 5: Question marks (uncertainty)
        question_marks = text.count('?')
        
        # Feature 6: Word repetition
        word_counts = {}
        for word in words:
            word_counts[word.lower()] = word_counts.get(word.lower(), 0) + 1
        repetition_count = sum(1 for count in word_counts.values() if count > 1)
        
        # Feature 7: Passive voice indicators
        passive_indicators = ['be', 'been', 'being', 'was', 'were', 'is', 'are']
        passive_count = sum(1 for word in passive_indicators if word in text_lower)
        
        features = np.array([
            hesitation_count,
            filler_ratio,
            avg_word_length,
            sentence_fragments,
            question_marks,
            repetition_count,
            passive_count
        ]).reshape(1, -1)
        
        return features
    
    def detect_hesitation(self, text: str) -> HesitationResult:
        """
        Detect hesitation in text
        
        Args:
            text: Input text to analyze
            
        Returns:
            HesitationResult with detection details
        """
        if not self.model or not self.scaler:
            raise RuntimeError("Hesitation model not loaded")
        
        # Extract features
        features = self.extract_features(text)
        
        # Scale features
        scaled_features = self.scaler.transform(features)
        
        # Predict
        prediction = self.model.predict(scaled_features)[0]
        
        # Get probability if model supports it
        if hasattr(self.model, 'predict_proba'):
            confidence = float(self.model.predict_proba(scaled_features)[0][prediction])
        else:
            confidence = 0.8 if prediction else 0.2
        
        # Determine hesitation level
        if confidence > 0.7:
            level = "high"
        elif confidence > 0.4:
            level = "medium"
        else:
            level = "low"
        
        # Get feature details
        feature_details = {
            "hesitation_count": int(features[0, 0]),
            "filler_ratio": float(features[0, 1]),
            "avg_word_length": float(features[0, 2]),
            "sentence_fragments": int(features[0, 3]),
            "question_marks": int(features[0, 4]),
            "repetition_count": int(features[0, 5]),
            "passive_count": int(features[0, 6])
        }
        
        logger.info(f"Hesitation detection: {prediction}, confidence: {confidence:.2f}")
        
        return HesitationResult(
            hesitation_detected=bool(prediction),
            confidence_score=confidence,
            hesitation_level=level,
            features=feature_details
        )


# Global instance
hesitation_detector = HesitationDetector()
