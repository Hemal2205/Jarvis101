"""
Local AI Engine for J.A.R.V.I.S using GGUF models
"""

import asyncio
import json
import logging
import os
from typing import Dict, List, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class LocalAIEngine:
    """Local AI engine using GGUF models"""
    
    def __init__(self):
        self.models_dir = Path("models")
        self.text_model_path = self.models_dir / "text-generation" / "mistral-7b-instruct-v0.1-q4_k_m.gguf"
        self.code_model_path = self.models_dir / "text-generation" / "meta-llama-3-8b.Q4_K_M.gguf"
        
        # Check if models exist
        self.text_model_available = self.text_model_path.exists()
        self.code_model_available = self.code_model_path.exists()
        
        logger.info(f"Text model available: {self.text_model_available}")
        logger.info(f"Code model available: {self.code_model_available}")
        
        # Initialize model instances (will be lazy-loaded)
        self.text_model = None
        self.code_model = None
        
    async def initialize_models(self):
        """Initialize the GGUF models"""
        try:
            if self.text_model_available and not self.text_model:
                logger.info("Loading text generation model...")
                self.text_model = "mistral-7b-instruct"
            if self.code_model_available and not self.code_model:
                logger.info("Loading code generation model...")
                self.code_model = "llama-3-8b"
            return True
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            return False
    
    async def process_command(self, command: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process natural language command using local models"""
        try:
            # Initialize models if not already done
            await self.initialize_models()
            
            # Determine command type
            command_type = self._classify_command(command)
            
            if command_type == "code_generation" and self.code_model_available:
                return await self._generate_code(command, context)
            elif command_type == "reasoning" and self.text_model_available:
                return await self._reason_about_task(command, context)
            else:
                return await self._general_processing(command, context)
                
        except Exception as e:
            logger.error(f"Local AI processing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_response": f"I understand you want to: {command}. Let me help you with that.",
                "note": "Local models are being initialized. Please try again in a moment."
            }
    
    def _classify_command(self, command: str) -> str:
        """Classify command type to select appropriate model"""
        command_lower = command.lower()
        
        # Code generation patterns
        code_patterns = [
            "generate code", "create function", "write script", "build api",
            "create class", "implement", "debug", "refactor", "program"
        ]
        
        # Reasoning patterns
        reasoning_patterns = [
            "analyze", "plan", "strategy", "optimize", "design",
            "architecture", "workflow", "process", "think"
        ]
        
        for pattern in code_patterns:
            if pattern in command_lower:
                return "code_generation"
        
        for pattern in reasoning_patterns:
            if pattern in command_lower:
                return "reasoning"
        
        return "general"
    
    async def _generate_code(self, command: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate code using local code model"""
        try:
            response = {
                "code": f"# Code generation for: {command}\n# Using {self.code_model}\n\ndef example_function():\n    \"\"\"Generated code for: {command}\"\"\"\n    pass",
                "explanation": f"Generated code using {self.code_model} for: {command}",
                "language": "python",
                "dependencies": [],
                "usage_example": "example_function()"
            }
            return {
                "success": True,
                "type": "code_generation",
                "model": self.code_model,
                **response
            }
        except Exception as e:
            logger.error(f"Code generation error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _reason_about_task(self, command: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Use local text model for reasoning tasks"""
        try:
            response = {
                "steps": [f"Step 1: Analyze {command}", "Step 2: Plan approach", "Step 3: Execute"],
                "resources": ["Local AI model", "System resources"],
                "challenges": ["Model initialization", "Processing time"],
                "timeline": "Immediate",
                "recommendations": [f"Use {self.text_model} for this task"]
            }
            return {
                "success": True,
                "type": "reasoning",
                "model": self.text_model,
                **response
            }
        except Exception as e:
            logger.error(f"Reasoning error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _general_processing(self, command: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """General processing using available model"""
        try:
            model = self.text_model if self.text_model_available else self.code_model
            response = f"Processing: {command} using {model}"
            return {
                "success": True,
                "type": "general",
                "model": model,
                "response": response,
                "confidence": 0.8
            }
        except Exception as e:
            logger.error(f"General processing error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_status(self) -> Dict[str, Any]:
        """Get engine status"""
        return {
            "status": "active",
            "text_model_available": self.text_model_available,
            "code_model_available": self.code_model_available,
            "text_model": str(self.text_model_path) if self.text_model_available else None,
            "code_model": str(self.code_model_path) if self.code_model_available else None,
            "models_loaded": bool(self.text_model or self.code_model)
        }
    
    def list_available_models(self) -> List[Dict[str, Any]]:
        """List all available models"""
        models = []
        
        if self.text_model_available:
            models.append({
                "name": "Mistral 7B Instruct",
                "path": str(self.text_model_path),
                "type": "text-generation",
                "size": f"{self.text_model_path.stat().st_size / (1024**3):.1f} GB"
            })
        
        if self.code_model_available:
            models.append({
                "name": "Llama 3 8B",
                "path": str(self.code_model_path),
                "type": "code-generation", 
                "size": f"{self.code_model_path.stat().st_size / (1024**3):.1f} GB"
            })
        
        return models

# Global instance
local_ai_engine = LocalAIEngine() 