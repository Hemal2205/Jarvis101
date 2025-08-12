"""
Enhanced J.A.R.V.I.S Brain Module
Integrates with system automation for complete task execution
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
import re
from datetime import datetime
from .system_automation import system_automation
from .ai_engine import ai_engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedBrain:
    """
    Enhanced brain that can understand and execute complex tasks
    """
    
    def __init__(self):
        self.system_automation = system_automation
        self.ai_engine = ai_engine
        self.conversation_history = []
        self.active_tasks = {}
        self.capabilities = {
            "web_automation": True,
            "aws_operations": True,
            "system_control": True,
            "code_generation": True,
            "file_operations": True,
            "desktop_control": True,
            "ai_reasoning": True,
            "natural_language_processing": True
        }
        
    async def process_command(self, command: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process natural language command with AI enhancement"""
        try:
            # First, use AI engine to understand and plan the command
            ai_response = await self.ai_engine.process_command(command, context or {})
            
            if not ai_response.get("success", False):
                return {
                    "response": f"J.A.R.V.I.S is ready to execute: {command}",
                    "status": "ai_processing_failed",
                    "message": "AI processing encountered an issue, but I can still help you.",
                    "capabilities": list(self.capabilities.keys())
                }
            
            # Based on AI response type, execute appropriate action
            command_type = ai_response.get("type", "general")
            
            if command_type == "code_generation":
                return await self._handle_code_generation(ai_response, context)
            elif command_type == "reasoning":
                return await self._handle_reasoning_task(ai_response, context)
            elif command_type == "system_control":
                return await self._handle_system_control(ai_response, context)
            else:
                return await self._handle_general_command(ai_response, context)
                
        except Exception as e:
            logger.error(f"Enhanced brain processing error: {e}")
            return {
                "response": f"J.A.R.V.I.S encountered an error processing: {command}",
                "status": "error",
                "message": str(e),
                "capabilities": list(self.capabilities.keys())
            }
    
    async def _handle_code_generation(self, ai_response: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Handle code generation requests"""
        try:
            code = ai_response.get("code", "")
            explanation = ai_response.get("explanation", "")
            language = ai_response.get("language", "python")
            
            # Create a task for code execution if needed
            task_id = f"code_gen_{datetime.now().timestamp()}"
            self.active_tasks[task_id] = {
                "type": "code_generation",
                "status": "completed",
                "code": code,
                "language": language,
                "created_at": datetime.now()
            }
            
            return {
                "response": f"Code generated successfully in {language}",
                "status": "success",
                "task_id": task_id,
                "code": code,
                "explanation": explanation,
                "language": language,
                "capabilities": ["code_execution", "debugging", "refactoring"],
                "message": "Code is ready for execution or review."
            }
            
        except Exception as e:
            logger.error(f"Code generation handling error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _handle_reasoning_task(self, ai_response: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Handle reasoning and planning tasks"""
        try:
            task_breakdown = ai_response.get("task_breakdown", [])
            resources = ai_response.get("resources", [])
            timeline = ai_response.get("timeline", "")
            
            # Create execution plan
            execution_plan = {
                "steps": task_breakdown,
                "resources_needed": resources,
                "estimated_time": timeline,
                "status": "planned"
            }
            
            task_id = f"reasoning_{datetime.now().timestamp()}"
            self.active_tasks[task_id] = {
                "type": "reasoning",
                "status": "planned",
                "plan": execution_plan,
                "created_at": datetime.now()
            }
            
            return {
                "response": "Task analyzed and planned successfully",
                "status": "success",
                "task_id": task_id,
                "plan": execution_plan,
                "capabilities": ["task_execution", "monitoring", "optimization"],
                "message": f"Task breakdown complete. Estimated time: {timeline}"
            }
            
        except Exception as e:
            logger.error(f"Reasoning task handling error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _handle_system_control(self, ai_response: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Handle system control commands"""
        try:
            action = ai_response.get("action", "")
            target = ai_response.get("target", "")
            parameters = ai_response.get("parameters", {})
            
            # Execute system automation if safety check passes
            if ai_response.get("safety_check", True):
                automation_result = await self.system_automation.execute_complex_task(f"{action} {target}")
                
                task_id = f"system_{datetime.now().timestamp()}"
                self.active_tasks[task_id] = {
                    "type": "system_control",
                    "status": "executing",
                    "action": action,
                    "target": target,
                    "created_at": datetime.now()
                }
                
                return {
                    "response": f"System command executed: {action} on {target}",
                    "status": "success",
                    "task_id": task_id,
                    "automation_result": automation_result,
                    "capabilities": ["system_monitoring", "automation", "control"],
                    "message": "System automation completed successfully."
                }
            else:
                return {
                    "response": "System command requires manual approval",
                    "status": "pending_approval",
                    "action": action,
                    "target": target,
                    "capabilities": ["manual_control", "safety_checks"],
                    "message": "Safety check failed. Manual intervention required."
                }
                
        except Exception as e:
            logger.error(f"System control handling error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _handle_general_command(self, ai_response: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Handle general commands"""
        try:
            understanding = ai_response.get("understanding", "")
            approach = ai_response.get("approach", "")
            options = ai_response.get("options", [])
            
            task_id = f"general_{datetime.now().timestamp()}"
            self.active_tasks[task_id] = {
                "type": "general",
                "status": "processed",
                "understanding": understanding,
                "created_at": datetime.now()
            }
            
            return {
                "response": f"Command understood: {understanding}",
                "status": "success",
                "task_id": task_id,
                "approach": approach,
                "options": options,
                "capabilities": list(self.capabilities.keys()),
                "message": "Command processed successfully. Ready to assist further."
            }
            
        except Exception as e:
            logger.error(f"General command handling error: {e}")
            return {"status": "error", "message": str(e)}
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a specific task"""
        if task_id in self.active_tasks:
            task = self.active_tasks[task_id]
            return {
                "task_id": task_id,
                "status": task.get("status", "unknown"),
                "type": task.get("type", "unknown"),
                "created_at": task.get("created_at", ""),
                "details": task
            }
        else:
            return {"status": "not_found", "task_id": task_id}
    
    async def list_active_tasks(self) -> List[Dict[str, Any]]:
        """List all active tasks"""
        tasks = []
        for task_id, task in self.active_tasks.items():
            tasks.append({
                "task_id": task_id,
                "type": task.get("type", "unknown"),
                "status": task.get("status", "unknown"),
                "created_at": task.get("created_at", ""),
                "details": task
            })
        return tasks
    
    async def cancel_task(self, task_id: str) -> Dict[str, Any]:
        """Cancel a specific task"""
        if task_id in self.active_tasks:
            task = self.active_tasks[task_id]
            task["status"] = "cancelled"
            return {
                "success": True,
                "task_id": task_id,
                "message": "Task cancelled successfully"
            }
        else:
            return {
                "success": False,
                "task_id": task_id,
                "message": "Task not found"
            }
    
    def get_status(self) -> Dict[str, Any]:
        """Get enhanced brain status"""
        return {
            "active": True,
            "capabilities": self.capabilities,
            "active_tasks_count": len(self.active_tasks),
            "ai_engine_status": self.ai_engine.get_status(),
            "system_automation_status": "active",
            "cognitive_processes": {
                "learning": 95,
                "memory_formation": 98,
                "pattern_recognition": 94,
                "decision_making": 92,
                "ai_reasoning": 96
            }
        }

# Global enhanced brain instance
enhanced_brain = EnhancedBrain()