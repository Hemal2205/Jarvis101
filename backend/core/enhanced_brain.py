"""
Enhanced J.A.R.V.I.S Brain Module
Integrates with system automation for complete task execution
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
import re
from datetime import datetime
from .system_automation import system_automation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedBrain:
    """
    Enhanced brain that can understand and execute complex tasks
    """
    
    def __init__(self):
        self.system_automation = system_automation
        self.conversation_history = []
        self.active_tasks = {}
        self.capabilities = {
            "web_automation": True,
            "aws_operations": True,
            "system_control": True,
            "code_generation": True,
            "file_operations": True,
            "desktop_control": True
        }
    
    async def process_command(self, command: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process natural language commands and execute them"""
        
        logger.info(f"Processing command: {command}")
        
        # Add to conversation history
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "command": command,
            "context": context or {}
        })
        
        # Analyze command intent
        intent = await self.analyze_intent(command)
        
        # Execute based on intent
        if intent["type"] == "complex_task":
            return await self.execute_complex_task(command, intent)
        elif intent["type"] == "system_operation":
            return await self.execute_system_operation(command, intent)
        elif intent["type"] == "information_request":
            return await self.handle_information_request(command, intent)
        elif intent["type"] == "automation_task":
            return await self.execute_automation_task(command, intent)
        else:
            return await self.handle_general_command(command, intent)
    
    async def analyze_intent(self, command: str) -> Dict[str, Any]:
        """Analyze command intent and extract parameters"""
        
        command_lower = command.lower()
        
        # Complex task patterns
        if any(keyword in command_lower for keyword in ["create", "build", "deploy", "setup", "pipeline"]):
            if any(keyword in command_lower for keyword in ["aws", "lambda", "s3", "ec2", "cloud"]):
                return {
                    "type": "complex_task",
                    "category": "aws_deployment",
                    "complexity": "high",
                    "requires_automation": True
                }
            elif any(keyword in command_lower for keyword in ["website", "app", "application"]):
                return {
                    "type": "complex_task",
                    "category": "application_development",
                    "complexity": "high",
                    "requires_automation": True
                }
        
        # System operations
        if any(keyword in command_lower for keyword in ["open", "launch", "start", "run", "execute"]):
            return {
                "type": "system_operation",
                "category": "application_control",
                "complexity": "medium",
                "requires_automation": True
            }
        
        # Information requests
        if any(keyword in command_lower for keyword in ["what", "how", "why", "when", "where", "show", "tell"]):
            return {
                "type": "information_request",
                "category": "query",
                "complexity": "low",
                "requires_automation": False
            }
        
        # Automation tasks
        if any(keyword in command_lower for keyword in ["automate", "control", "manage", "handle"]):
            return {
                "type": "automation_task",
                "category": "process_automation",
                "complexity": "medium",
                "requires_automation": True
            }
        
        # Default to general command
        return {
            "type": "general_command",
            "category": "general",
            "complexity": "low",
            "requires_automation": False
        }
    
    async def execute_complex_task(self, command: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Execute complex multi-step tasks"""
        
        task_id = f"task_{datetime.now().timestamp()}"
        
        try:
            # Use system automation to execute the task
            result = await self.system_automation.execute_complex_task(command)
            
            # Store task result
            self.active_tasks[task_id] = {
                "command": command,
                "intent": intent,
                "result": result,
                "status": "completed",
                "timestamp": datetime.now().isoformat()
            }
            
            return {
                "task_id": task_id,
                "status": "success",
                "message": f"Complex task executed successfully: {command}",
                "result": result,
                "execution_time": self.calculate_execution_time(result)
            }
            
        except Exception as e:
            logger.error(f"Complex task execution failed: {str(e)}")
            return {
                "task_id": task_id,
                "status": "error",
                "message": f"Task execution failed: {str(e)}",
                "error": str(e)
            }
    
    async def execute_system_operation(self, command: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Execute system-level operations"""
        
        # Extract application name or operation
        operation = self.extract_operation_details(command)
        
        if operation["type"] == "launch_application":
            app_name = operation["target"]
            actions = operation.get("actions", [])
            
            result = await self.system_automation.control_desktop_application(app_name, actions)
            
            return {
                "status": "success",
                "message": f"Application {app_name} controlled successfully",
                "result": result
            }
        
        elif operation["type"] == "system_command":
            step = {
                "type": "system_operation",
                "action": "run_command",
                "command": operation["command"]
            }
            
            result = await self.system_automation.execute_step(step)
            
            return {
                "status": "success",
                "message": "System command executed",
                "result": result
            }
        
        else:
            return {
                "status": "error",
                "message": f"Unknown system operation: {operation['type']}"
            }
    
    async def handle_information_request(self, command: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Handle information requests"""
        
        if "system" in command.lower() and "status" in command.lower():
            system_info = await self.system_automation.monitor_system_resources()
            return {
                "status": "success",
                "message": "System status retrieved",
                "data": system_info
            }
        
        elif "capabilities" in command.lower() or "what can you do" in command.lower():
            return {
                "status": "success",
                "message": "J.A.R.V.I.S Capabilities",
                "data": {
                    "capabilities": self.capabilities,
                    "features": [
                        "Complete system automation",
                        "AWS cloud operations",
                        "Web browser automation",
                        "Desktop application control",
                        "Code generation and deployment",
                        "File system operations",
                        "Complex task execution",
                        "Multi-step process automation"
                    ]
                }
            }
        
        else:
            return {
                "status": "success",
                "message": "Information request processed",
                "data": {
                    "response": "I can help you with system automation, AWS operations, application control, and much more. What would you like me to do?"
                }
            }
    
    async def execute_automation_task(self, command: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Execute automation tasks"""
        
        # Parse automation requirements
        automation_details = self.parse_automation_requirements(command)
        
        if automation_details["type"] == "web_automation":
            # Execute web automation
            steps = automation_details["steps"]
            results = []
            
            for step in steps:
                result = await self.system_automation.execute_browser_action(step)
                results.append(result)
            
            return {
                "status": "success",
                "message": "Web automation completed",
                "results": results
            }
        
        elif automation_details["type"] == "process_automation":
            # Execute process automation
            return await self.system_automation.execute_complex_task(command)
        
        else:
            return {
                "status": "error",
                "message": f"Unknown automation type: {automation_details['type']}"
            }
    
    async def handle_general_command(self, command: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Handle general commands"""
        
        return {
            "status": "success",
            "message": "Command processed",
            "response": f"I understand you want me to: {command}. I'm ready to execute this task with full system automation capabilities.",
            "suggestions": [
                "Be more specific about what you want me to create or automate",
                "I can handle complex tasks like AWS deployments, application control, and system operations",
                "Try commands like 'Create a pipeline for solar plants' or 'Open Chrome and navigate to AWS'"
            ]
        }
    
    def extract_operation_details(self, command: str) -> Dict[str, Any]:
        """Extract operation details from command"""
        
        command_lower = command.lower()
        
        # Application launch patterns
        if any(keyword in command_lower for keyword in ["open", "launch", "start"]):
            # Extract application name
            apps = ["chrome", "firefox", "vscode", "terminal", "calculator", "notepad"]
            for app in apps:
                if app in command_lower:
                    return {
                        "type": "launch_application",
                        "target": app,
                        "actions": []
                    }
        
        # System command patterns
        if any(keyword in command_lower for keyword in ["run", "execute", "command"]):
            # Extract command to run
            if "run" in command_lower:
                cmd_part = command_lower.split("run", 1)[1].strip()
                return {
                    "type": "system_command",
                    "command": cmd_part
                }
        
        return {
            "type": "unknown",
            "target": None
        }
    
    def parse_automation_requirements(self, command: str) -> Dict[str, Any]:
        """Parse automation requirements from command"""
        
        command_lower = command.lower()
        
        if any(keyword in command_lower for keyword in ["browser", "web", "website", "navigate"]):
            return {
                "type": "web_automation",
                "steps": [
                    {
                        "action": "open_browser",
                        "url": "https://example.com"
                    }
                ]
            }
        
        else:
            return {
                "type": "process_automation",
                "steps": []
            }
    
    def calculate_execution_time(self, result: Dict[str, Any]) -> float:
        """Calculate execution time from result"""
        # Simple calculation based on number of steps
        if "results" in result:
            return len(result["results"]) * 2.5  # Average 2.5 seconds per step
        return 1.0
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a specific task"""
        
        if task_id in self.active_tasks:
            return self.active_tasks[task_id]
        else:
            return {
                "error": f"Task {task_id} not found"
            }
    
    async def list_active_tasks(self) -> List[Dict[str, Any]]:
        """List all active tasks"""
        
        return list(self.active_tasks.values())
    
    async def cancel_task(self, task_id: str) -> Dict[str, Any]:
        """Cancel a running task"""
        
        if task_id in self.active_tasks:
            # Mark as cancelled
            self.active_tasks[task_id]["status"] = "cancelled"
            
            return {
                "status": "success",
                "message": f"Task {task_id} cancelled"
            }
        else:
            return {
                "error": f"Task {task_id} not found"
            }
    
    def cleanup(self):
        """Cleanup resources"""
        self.system_automation.cleanup()

# Global instance
enhanced_brain = EnhancedBrain()