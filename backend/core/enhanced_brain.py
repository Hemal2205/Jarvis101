"""
Enhanced J.A.R.V.I.S Brain Module
Integrates with system automation for complete task execution
"""

import asyncio
import logging
from typing import Dict, List, Any
from datetime import datetime
from .system_automation import system_automation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedBrain:
    """
    Enhanced brain that can understand and execute complex tasks by
    delegating to the SystemAutomation module.
    """
    
    def __init__(self):
        self.system_automation = system_automation
        self.active_tasks = {}
        self.capabilities = {
            "dynamic_task_execution": True,
            "web_automation": True,
            "system_control": True,
            "file_operations": True,
        }
    
    async def process_command(self, command: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Processes a natural language command by passing it to the system automation module.
        """
        logger.info(f"Processing command with dynamic planner: {command}")
        
        task_id = f"task_{datetime.now().timestamp()}"
        
        try:
            # The system_automation module now handles the entire complex task execution loop.
            result = await self.system_automation.execute_complex_task(command)
            
            self.active_tasks[task_id] = {
                "command": command,
                "result": result,
                "status": result.get("status", "unknown"),
                "timestamp": datetime.now().isoformat()
            }
            
            return {
                "task_id": task_id,
                "status": "success",
                "message": f"Task execution process finished for: {command}",
                "result": result
            }
            
        except Exception as e:
            logger.error(f"Complex task execution failed in brain: {str(e)}")
            return {
                "task_id": task_id,
                "status": "error",
                "message": f"A critical error occurred in the brain module: {str(e)}",
            }
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a specific task"""
        return self.active_tasks.get(task_id, {"error": f"Task {task_id} not found"})
    
    async def list_active_tasks(self) -> List[Dict[str, Any]]:
        """List all active tasks"""
        return list(self.active_tasks.values())
    
    async def cancel_task(self, task_id: str) -> Dict[str, Any]:
        """Cancel a running task (Note: actual process cancellation not implemented in this version)"""
        if task_id in self.active_tasks:
            self.active_tasks[task_id]["status"] = "cancelled"
            return {"status": "success", "message": f"Task {task_id} marked as cancelled"}
        else:
            return {"error": f"Task {task_id} not found"}
    
    def cleanup(self):
        """Cleanup resources"""
        self.system_automation.cleanup()

# Global instance
enhanced_brain = EnhancedBrain()