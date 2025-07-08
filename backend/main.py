from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import os
from core.brain import JarvisBrain
from core.security import SecurityManager
from core.memory import MemoryVault
from core.copy_engine import CopyEngine
from core.stealth import StealthManager
from core.evolution import EvolutionEngine

# Global instances
jarvis_brain = None
security_manager = None
memory_vault = None
copy_engine = None
stealth_manager = None
evolution_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global jarvis_brain, security_manager, memory_vault, copy_engine, stealth_manager, evolution_engine
    
    # Ensure data directories exist
    os.makedirs("data", exist_ok=True)
    os.makedirs("backups", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    # Initialize core systems
    jarvis_brain = JarvisBrain()
    security_manager = SecurityManager()
    memory_vault = MemoryVault()
    copy_engine = CopyEngine()
    stealth_manager = StealthManager()
    evolution_engine = EvolutionEngine()
    
    # Initialize async components
    await memory_vault.initialize()
    await copy_engine.initialize()
    await evolution_engine.initialize()
    
    yield
    
    # Shutdown
    if evolution_engine:
        evolution_engine.shutdown()

app = FastAPI(title="J.A.R.V.I.S System", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "J.A.R.V.I.S System Online", "status": "operational"}

@app.get("/api/status")
async def get_system_status():
    return {
        "brain": jarvis_brain.get_status(),
        "security": security_manager.get_status(),
        "memory": memory_vault.get_status(),
        "evolution": evolution_engine.get_status()
    }

@app.post("/api/authenticate")
async def authenticate(credentials: dict):
    try:
        result = await security_manager.authenticate(credentials)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/api/command")
async def process_command(command: dict):
    try:
        result = await jarvis_brain.process_command(command)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memories")
async def get_memories():
    try:
        memories = await memory_vault.get_memories()
        return memories
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
        result = await stealth_manager.activate_mode(mode)
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
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)