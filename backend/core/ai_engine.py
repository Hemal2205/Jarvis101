"""
Advanced AI Engine for J.A.R.V.I.S
Multi-LLM integration with enhanced reasoning and code generation
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
import aiohttp
import openai
from datetime import datetime
import re
import os

logger = logging.getLogger(__name__)

class AIEngine:
    """Advanced AI engine with multi-LLM support"""
    
    def __init__(self):
        self.models = {
            "nous_hermes": {
                "name": "Nous Hermes 2.5",
                "endpoint": "https://api.nousresearch.com/v1/chat/completions",
                "capabilities": ["reasoning", "planning", "analysis"],
                "status": "active"
            },
            "dolphin_phi": {
                "name": "Dolphin-Phi-2",
                "endpoint": "https://api.dolphin-ai.com/v1/chat/completions", 
                "capabilities": ["nlp", "command_parsing", "intent_recognition"],
                "status": "active"
            },
            "qwen_coder": {
                "name": "Qwen2.5 Coder",
                "endpoint": "https://api.qwen.ai/v1/chat/completions",
                "capabilities": ["code_generation", "debugging", "refactoring"],
                "status": "active"
            },
            "openai_gpt4": {
                "name": "OpenAI GPT-4",
                "endpoint": "https://api.openai.com/v1/chat/completions",
                "capabilities": ["reasoning", "conversation", "code_generation"],
                "status": "active"
            },
            "gemini": {
                "name": "Gemini",
                "endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                "capabilities": ["reasoning", "conversation", "code_generation"],
                "status": "active"
            }
        }
        self.conversation_history = []
        self.task_queue = asyncio.Queue()
        self.response_cache = {}
        # Placeholder: API keys (should be set via admin or user prompt)
        self.openai_api_key = os.environ.get("OPENAI_API_KEY", "")
        self.gemini_api_key = "AIzaSyCqXzu-tmqD6UHg5QjsPAz0UJay3wIKfEQ"
        self.model_preference = os.environ.get("JARVIS_LLM_MODEL", "openai_gpt4")
        
    async def process_command(self, command: str, context: Optional[Dict[str, Any]] = None, user_model: Optional[str] = None, openai_api_key: Optional[str] = None, gemini_api_key: Optional[str] = None) -> Dict[str, Any]:
        """Process natural language command using appropriate AI model"""
        try:
            # Determine command type and select appropriate model
            command_type = self._classify_command(command)
            model = user_model or self.model_preference
            # Use the correct API key for the selected model
            if model == "openai_gpt4":
                api_key = openai_api_key or self.openai_api_key
            elif model == "gemini":
                api_key = gemini_api_key or self.gemini_api_key
            else:
                api_key = None
            logger.info(f"[LLM] Using model: {model}, OpenAI key set: {bool(openai_api_key or self.openai_api_key)}, Gemini key set: {bool(gemini_api_key or self.gemini_api_key)}")
            context = context or {}
            if command_type == "code_generation":
                return await self._generate_code(command, context, model, api_key)
            elif command_type == "reasoning":
                return await self._reason_about_task(command, context, model, api_key)
            elif command_type == "system_control":
                return await self._parse_system_command(command, context, model, api_key)
            else:
                return await self._general_processing(command, context, model, api_key)
        except Exception as e:
            logger.error(f"AI processing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_response": f"I understand you want to: {command}. Let me help you with that."
            }
    
    def _classify_command(self, command: str) -> str:
        """Classify command type to select appropriate AI model"""
        command_lower = command.lower()
        
        # Code generation patterns
        code_patterns = [
            "generate code", "create function", "write script", "build api",
            "create class", "implement", "debug", "refactor"
        ]
        
        # Reasoning patterns
        reasoning_patterns = [
            "analyze", "plan", "strategy", "optimize", "design",
            "architecture", "workflow", "process"
        ]
        
        # System control patterns
        system_patterns = [
            "open", "close", "start", "stop", "launch", "execute",
            "automate", "monitor", "control"
        ]
        
        for pattern in code_patterns:
            if pattern in command_lower:
                return "code_generation"
        
        for pattern in reasoning_patterns:
            if pattern in command_lower:
                return "reasoning"
        
        for pattern in system_patterns:
            if pattern in command_lower:
                return "system_control"
        
        return "general"
    
    async def _generate_code(self, command: str, context: Optional[Dict[str, Any]] = None, model: str = "qwen_coder", api_key: Optional[str] = None) -> Dict[str, Any]:
        """Generate code using Qwen Coder model"""
        context = context or {}
        model = model or "qwen_coder"
        try:
            prompt = f"""
            Generate code for the following request: {command}
            
            Context: {json.dumps(context) if context else 'No additional context'}
            
            Requirements:
            1. Generate clean, well-documented code
            2. Include error handling
            3. Follow best practices
            4. Provide usage examples
            5. Include comments explaining complex logic
            
            Please provide the code in a structured format with explanations.
            """
            
            # Simulate AI response (replace with actual API call)
            response = await self._call_ai_model(model, prompt, api_key)
            
            return {
                "success": True,
                "type": "code_generation",
                "code": response.get("code", ""),
                "explanation": response.get("explanation", ""),
                "language": response.get("language", "python"),
                "dependencies": response.get("dependencies", []),
                "usage_example": response.get("usage_example", "")
            }
            
        except Exception as e:
            logger.error(f"Code generation error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _reason_about_task(self, command: str, context: Optional[Dict[str, Any]] = None, model: str = "nous_hermes", api_key: Optional[str] = None) -> Dict[str, Any]:
        """Use Nous Hermes for complex reasoning tasks"""
        context = context or {}
        model = model or "nous_hermes"
        try:
            prompt = f"""
            Analyze and plan the following task: {command}
            
            Context: {json.dumps(context) if context else 'No additional context'}
            
            Please provide:
            1. Task breakdown into steps
            2. Required resources and dependencies
            3. Potential challenges and solutions
            4. Success criteria
            5. Timeline estimation
            """
            
            response = await self._call_ai_model(model, prompt, api_key)
            
            return {
                "success": True,
                "type": "reasoning",
                "task_breakdown": response.get("steps", []),
                "resources": response.get("resources", []),
                "challenges": response.get("challenges", []),
                "timeline": response.get("timeline", ""),
                "recommendations": response.get("recommendations", [])
            }
            
        except Exception as e:
            logger.error(f"Reasoning error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _parse_system_command(self, command: str, context: Optional[Dict[str, Any]] = None, model: str = "dolphin_phi", api_key: Optional[str] = None) -> Dict[str, Any]:
        """Parse system control commands using Dolphin Phi"""
        context = context or {}
        model = model or "dolphin_phi"
        try:
            prompt = f"""
            Parse this system command: {command}
            
            Context: {json.dumps(context) if context else 'No additional context'}
            
            Extract:
            1. Action to perform
            2. Target application/system
            3. Parameters or options
            4. Safety considerations
            5. Alternative approaches
            """
            
            response = await self._call_ai_model(model, prompt, api_key)
            
            return {
                "success": True,
                "type": "system_control",
                "action": response.get("action", ""),
                "target": response.get("target", ""),
                "parameters": response.get("parameters", {}),
                "safety_check": response.get("safety_check", True),
                "alternatives": response.get("alternatives", [])
            }
            
        except Exception as e:
            logger.error(f"System command parsing error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _general_processing(self, command: str, context: Optional[Dict[str, Any]] = None, model: str = "dolphin_phi", api_key: Optional[str] = None) -> Dict[str, Any]:
        """General command processing using default model"""
        context = context or {}
        model = model or "dolphin_phi"
        try:
            prompt = f"""
            Process this command: {command}
            
            Context: {json.dumps(context) if context else 'No additional context'}
            
            Provide a helpful response with:
            1. Understanding of the request
            2. Suggested approach
            3. Available options
            4. Next steps
            """
            
            response = await self._call_ai_model(model, prompt, api_key)
            
            return {
                "success": True,
                "type": "general",
                "understanding": response.get("understanding", ""),
                "approach": response.get("approach", ""),
                "options": response.get("options", []),
                "next_steps": response.get("next_steps", [])
            }
            
        except Exception as e:
            logger.error(f"General processing error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _call_ai_model(self, model_name: str, prompt: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Call AI model API (real or simulated)"""
        if model_name == "openai_gpt4":
            # Real OpenAI GPT-4 API call
            import openai
            openai.api_key = api_key or self.openai_api_key
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            return response.choices[0].message.to_dict()
        elif model_name == "gemini":
            # Real Gemini API call (Google Generative Language API)
            import aiohttp
            url = self.models["gemini"]["endpoint"]
            headers = {"Authorization": f"Bearer {api_key or self.gemini_api_key}"}
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, headers=headers) as resp:
                    return await resp.json()
        elif model_name == "qwen_coder":
            # Simulate Qwen Coder API call
            await asyncio.sleep(0.1)
            return {
                "code": f"# Generated code for: {prompt[:50]}...\ndef example_function():\n    return 'Hello from JARVIS'",
                "explanation": "This is a sample code generation response",
                "language": "python",
                "dependencies": [],
                "usage_example": "example_function()"
            }
        elif model_name == "nous_hermes":
            # Simulate Nous Hermes API call
            await asyncio.sleep(0.1)
            return {
                "steps": ["Step 1: Analyze requirements", "Step 2: Plan approach", "Step 3: Execute"],
                "resources": ["Computing resources", "Time", "External APIs"],
                "challenges": ["Integration complexity", "Performance requirements"],
                "timeline": "2-3 hours",
                "recommendations": ["Start with MVP", "Test thoroughly"]
            }
        elif model_name == "dolphin_phi":
            # Simulate Dolphin Phi API call
            await asyncio.sleep(0.1)
            return {
                "action": "execute",
                "target": "system",
                "parameters": {"mode": "safe"},
                "safety_check": True,
                "alternatives": ["Manual execution", "Scheduled execution"]
            }
        else:
            # Fallback for other models or if model_name is not recognized
            await asyncio.sleep(0.1)
            return {
                "understanding": "Command understood",
                "approach": "Standard processing",
                "options": ["Option 1", "Option 2"],
                "next_steps": ["Proceed with execution"]
            }
    
    async def generate_response(self, input_text: str, context: Dict[str, Any] = None) -> str:
        """Generate natural language response"""
        try:
            prompt = f"""
            Generate a helpful response to: {input_text}
            
            Context: {json.dumps(context) if context else 'No additional context'}
            
            Style: Professional, helpful, and concise
            """
            
            response = await self._call_ai_model("dolphin_phi", prompt)
            return response.get("response", f"I understand: {input_text}. How can I help you with that?")
            
        except Exception as e:
            logger.error(f"Response generation error: {e}")
            return f"I'm here to help with: {input_text}"
    
    def get_status(self) -> Dict[str, Any]:
        """Get AI engine status"""
        return {
            "models": self.models,
            "conversation_history_length": len(self.conversation_history),
            "cache_size": len(self.response_cache),
            "queue_size": self.task_queue.qsize(),
            "capabilities": [
                "code_generation",
                "reasoning",
                "system_control",
                "natural_language_processing",
                "task_planning"
            ]
        }

# Global AI engine instance
ai_engine = AIEngine() 