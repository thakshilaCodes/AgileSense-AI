"""
Text rephrasing using T5 model
"""
import logging
import torch
from typing import List

from ..core.schemas import RephraseResult
from .model_loader import model_manager

logger = logging.getLogger(__name__)


class TextRephraser:
    """Rephrase text for clearer communication"""
    
    def __init__(self):
        self.model = model_manager.rephraser_model
        self.tokenizer = model_manager.rephraser_tokenizer
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        if self.model:
            self.model.to(self.device)
    
    def rephrase_text(self, text: str, context: str = None) -> RephraseResult:
        """
        Rephrase text for improved clarity and inclusivity
        
        Args:
            text: Original text to rephrase
            context: Optional context for better rephrasing
            
        Returns:
            RephraseResult with original and rephrased text
        """
        if not self.model or not self.tokenizer:
            raise RuntimeError("Rephraser model not loaded")
        
        # Prepare input with task prefix
        if context:
            input_text = f"rephrase with context {context}: {text}"
        else:
            input_text = f"rephrase: {text}"
        
        # Tokenize
        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(self.device)
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=200,
                num_beams=4,
                early_stopping=True,
                temperature=0.7,
                do_sample=True,
                top_p=0.9
            )
        
        # Decode
        rephrased_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Identify improvements
        improvements = self._identify_improvements(text, rephrased_text)
        
        logger.info(f"Rephrased text successfully")
        
        return RephraseResult(
            original_text=text,
            rephrased_text=rephrased_text,
            improvements=improvements
        )
    
    def _identify_improvements(self, original: str, rephrased: str) -> List[str]:
        """Identify what improvements were made"""
        improvements = []
        
        # Check for hedging words removal
        hedging_words = ["maybe", "perhaps", "possibly", "potentially", "kind of", "sort of", "I think"]
        for word in hedging_words:
            if word.lower() in original.lower() and word.lower() not in rephrased.lower():
                improvements.append(f"Removed hedging word: '{word}'")
        
        # Check for passive to active voice
        if " be " in original.lower() and " be " not in rephrased.lower():
            improvements.append("Converted passive to active voice")
        
        # Check for clarity improvements
        if len(rephrased.split()) < len(original.split()):
            improvements.append("Simplified sentence structure")
        
        if not improvements:
            improvements.append("Enhanced clarity and directness")
        
        return improvements


# Global instance
text_rephraser = TextRephraser()
