from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import enhanced modules, fall back to placeholders
try:
    from core.enhanced_brain import enhanced_brain
    from core.system_automation import system_automation
    ENHANCED_MODE = True
    logger.info("Enhanced J.A.R.V.I.S modules loaded successfully")
except ImportError as e:
    logger.warning(f"Enhanced modules not available: {e}")
    ENHANCED_MODE = False
    
    # Placeholder classes for missing modules
    class PlaceholderBrain:
        async def process_command(self, command, context=None):
            return {
                "response": f"J.A.R.V.I.S is ready to execute: {command}",
                "status": "placeholder_mode",
                "message": "Enhanced automation capabilities are being initialized...",
                "capabilities": [
                    "System automation",
                    "AWS operations", 
                    "Browser control",
                    "Desktop application control",
                    "Code generation",
                    "File operations"
                ]
            }
        
        async def get_task_status(self, task_id):
            return {"status": "placeholder", "task_id": task_id}
        
        async def list_active_tasks(self):
            return []
        
        async def cancel_task(self, task_id):
            return {"status": "placeholder", "message": "Task cancellation not available in placeholder mode"}
    
    class PlaceholderAutomation:
        async def execute_complex_task(self, task):
            return {
                "status": "placeholder",
                "message": f"Would execute: {task}",
                "execution_plan": [
                    {"description": "Parse task requirements"},
                    {"description": "Execute automation steps"},
                    {"description": "Return results"}
                ]
            }
        
        async def monitor_system_resources(self):
            return {
                "cpu_percent": 25.0,
                "memory_percent": 45.0,
                "disk_usage": 60.0,
                "status": "placeholder"
            }
    
    enhanced_brain = PlaceholderBrain()
    system_automation = PlaceholderAutomation()

class PlaceholderSecurity:
    async def authenticate(self, credentials):
        return {"authenticated": True, "user": "demo"}

class PlaceholderMemory:
    async def initialize(self):
        pass
    
    async def get_memories(self):
        return []
    
    async def create_memory(self, memory):
        return {"id": "demo", "status": "created"}

class PlaceholderCopyEngine:
    async def initialize(self):
        pass
    
    async def create_copy(self, config):
        return {"id": "demo", "status": "created"}

class PlaceholderStealth:
    async def activate_mode(self, mode):
        return {"mode": mode, "status": "activated"}

class PlaceholderEvolution:
    async def initialize(self):
        pass
    
    def shutdown(self):
        pass
    
    async def trigger_evolution(self):
        return {"status": "evolution triggered", "version": "1.0.0"}

# Global instances
jarvis_brain = enhanced_brain
security_manager = PlaceholderSecurity()
memory_vault = PlaceholderMemory()
copy_engine = PlaceholderCopyEngine()
stealth_system = PlaceholderStealth()
evolution_engine = PlaceholderEvolution()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 J.A.R.V.I.S System Starting...")
    
    # Initialize core systems
    await memory_vault.initialize()
    await copy_engine.initialize()
    await evolution_engine.initialize()
    
    logger.info("✅ J.A.R.V.I.S System Online")
    logger.info(f"Enhanced Mode: {ENHANCED_MODE}")
    
    yield
    
    # Shutdown
    logger.info("🔄 J.A.R.V.I.S System Shutting Down...")
    evolution_engine.shutdown()
    if ENHANCED_MODE:
        jarvis_brain.cleanup()
    logger.info("✅ J.A.R.V.I.S System Offline")

# Create FastAPI app
app = FastAPI(
    title="J.A.R.V.I.S - Just A Rather Very Intelligent System",
    description="Fully Autonomous AI System with Complete System Control",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "J.A.R.V.I.S System Online", "enhanced_mode": ENHANCED_MODE}

@app.get("/api/status")
async def get_system_status():
    system_info = await system_automation.monitor_system_resources()
    
    return {
        "status": "online",
        "enhanced_mode": ENHANCED_MODE,
        "system_info": system_info,
        "capabilities": {
            "system_automation": ENHANCED_MODE,
            "aws_operations": ENHANCED_MODE,
            "browser_control": ENHANCED_MODE,
            "desktop_control": ENHANCED_MODE,
            "code_generation": ENHANCED_MODE,
            "file_operations": ENHANCED_MODE
        }
    }

@app.post("/api/authenticate")
async def authenticate(credentials: dict):
    try:
        result = await security_manager.authenticate(credentials)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/command")
async def process_command(command: dict):
    try:
        command_text = command.get("text", "")
        context = command.get("context", {})
        
        result = await jarvis_brain.process_command(command_text, context)
        return result
    except Exception as e:
        logger.error(f"Command processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/execute-task")
async def execute_complex_task(task: dict):
    """Execute complex automation tasks"""
    try:
        task_description = task.get("description", "")
        
        if ENHANCED_MODE:
            result = await system_automation.execute_complex_task(task_description)
        else:
            result = await system_automation.execute_complex_task(task_description)
        
        return result
    except Exception as e:
        logger.error(f"Task execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks")
async def list_tasks():
    """List all active tasks"""
    try:
        tasks = await jarvis_brain.list_active_tasks()
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks/{task_id}")
async def get_task_status(task_id: str):
    """Get status of specific task"""
    try:
        status = await jarvis_brain.get_task_status(task_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/tasks/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a running task"""
    try:
        result = await jarvis_brain.cancel_task(task_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memories")
async def get_memories():
    try:
        memories = await memory_vault.get_memories()
        return {"memories": memories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memories")
async def create_memory(memory: dict):
    try:
        result = await memory_vault.create_memory(memory)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/copy/create")
async def create_copy(copy_config: dict):
    try:
        result = await copy_engine.create_copy(copy_config)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stealth/activate")
async def activate_stealth(mode: dict):
    try:
        result = await stealth_system.activate_mode(mode)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evolution/trigger")
async def trigger_evolution():
    try:
        result = await evolution_engine.trigger_evolution()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)