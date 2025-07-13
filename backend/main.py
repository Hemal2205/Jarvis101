from fastapi import FastAPI, HTTPException, Request
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
    from core.stealth_system import stealth_system
    from core.security import SecurityManager
    from core.skills_manager import SkillsManager
    from core.voice_manager import VoiceManager
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
        async def execute_task(self, task):
            return {"status": "placeholder", "message": "System automation not available in placeholder mode"}
        
        async def get_system_info(self):
            return {"cpu": "N/A", "memory": "N/A", "disk": "N/A"}
        
        async def monitor_system_resources(self):
            return {"status": "placeholder", "message": "System monitoring not available in placeholder mode"}
    
    class PlaceholderStealth:
        async def activate_mode(self, mode):
            return {"status": "placeholder", "message": "Stealth mode not available in placeholder mode"}
        
        async def activate_exam_mode(self):
            return {
                "status": "placeholder", 
                "message": "Exam mode not available in placeholder mode",
                "capabilities": [
                    "Question detection",
                    "Answer generation",
                    "Proctoring bypass"
                ]
            }
        
        async def activate_interview_mode(self):
            return {
                "status": "placeholder",
                "message": "Interview mode not available in placeholder mode",
                "capabilities": [
                    "Real-time response suggestions",
                    "Confidence boosting",
                    "Audio processing"
                ]
            }
        
        async def activate_passive_copilot(self):
            return {
                "status": "placeholder",
                "message": "Passive copilot not available in placeholder mode",
                "capabilities": [
                    "Background assistance",
                    "Draft generation",
                    "Code completion"
                ]
            }
        
        async def get_current_answers(self):
            return {"answers": [], "status": "placeholder"}
        
        async def deactivate(self):
            return {"status": "placeholder", "message": "Stealth deactivation not available in placeholder mode"}

class PlaceholderSecurity:
    async def authenticate(self, credentials):
        return {"authenticated": True, "user": "demo"}

    async def start_registration(self, username):
        return {"status": "registration started", "username": username}

    async def register_face_sample(self, image_data):
        return {"status": "face sample registered"}

    async def register_voice_sample(self, audio_data):
        return {"status": "voice sample registered"}

    async def complete_registration(self):
        return {"status": "registration completed"}

    async def authenticate_face(self, image_data):
        return {"authenticated": True, "user": "demo_face"}

    async def authenticate_voice(self, audio_data):
        return {"authenticated": True, "user": "demo_voice"}

class PlaceholderSkillsManager:
    async def start_learning(self, topic, user_id="default"):
        return {"status": "learning started", "topic": topic}
    
    async def get_learning_progress(self, user_id="default"):
        return {"progress": "placeholder mode"}
    
    async def get_skills_dashboard(self):
        return {"skills": [], "summary": {"total_skills": 0}}
    
    async def practice_skill(self, skill_id, user_id="default"):
        return {"status": "practice started"}
    
    async def complete_learning_session(self, session_id, completion_rate, feedback=""):
        return {"status": "session completed"}
    
    async def search_skills(self, query):
        return []
    
    def get_status(self):
        return {"status": "placeholder"}

class PlaceholderVoiceManager:
    async def speak(self, text, profile=None, priority='normal', effects=True):
        return {"status": "speech queued"}
    
    async def speak_template(self, template_category, template_params=None, **kwargs):
        return {"status": "template speech queued"}
    
    async def set_voice_profile(self, profile_name):
        return {"status": "voice profile set"}
    
    async def get_voice_profiles(self):
        return {"profiles": {}, "current_profile": "default"}
    
    async def play_startup_sound(self):
        return {"status": "startup sound played"}
    
    async def notify_learning_interruption(self, skill_name):
        return {"status": "interruption notification sent"}
    
    async def celebrate_skill_mastery(self, skill_name, level, user_name="User"):
        return {"status": "celebration sent"}
    
    def get_status(self):
        return {"status": "placeholder"}

class PlaceholderMemory:
    async def initialize(self):
        pass

    async def get_memories(self):
        return []

    async def create_memory(self, memory):
        return {"status": "placeholder", "memory_id": "demo"}

class PlaceholderCopyEngine:
    async def initialize(self):
        pass

    async def create_copy(self, config):
        return {"status": "placeholder", "copy_id": "demo"}

class PlaceholderEvolution:
    async def initialize(self):
        pass

    def shutdown(self):
        pass

    async def trigger_evolution(self):
        return {"status": "placeholder", "message": "Evolution not available in placeholder mode"}

# Initialize global instances
if ENHANCED_MODE:
    try:
        brain = enhanced_brain
        automation = system_automation
        stealth = stealth_system
        security_manager = SecurityManager()
        skills_manager = SkillsManager()
        voice_manager = VoiceManager()
    except Exception as e:
        logger.error(f"Error initializing enhanced modules: {e}")
        brain = PlaceholderBrain()
        automation = PlaceholderAutomation()
        stealth = PlaceholderStealth()
        security_manager = PlaceholderSecurity()
        skills_manager = PlaceholderSkillsManager()
        voice_manager = PlaceholderVoiceManager()
else:
    brain = PlaceholderBrain()
    automation = PlaceholderAutomation()
    stealth = PlaceholderStealth()
    security_manager = PlaceholderSecurity()
    skills_manager = PlaceholderSkillsManager()
    voice_manager = PlaceholderVoiceManager()

memory_manager = PlaceholderMemory()
copy_engine = PlaceholderCopyEngine()
evolution_engine = PlaceholderEvolution()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting J.A.R.V.I.S Enhanced System...")
    
    try:
        await memory_manager.initialize()
        await copy_engine.initialize()
        await evolution_engine.initialize()
        
        # Play startup sound
        await voice_manager.play_startup_sound()
        
        logger.info("J.A.R.V.I.S Enhanced System started successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        yield
    
    finally:
        # Shutdown
        logger.info("Shutting down J.A.R.V.I.S Enhanced System...")
        
        try:
            await voice_manager.shutdown()
            await skills_manager.shutdown()
            evolution_engine.shutdown()
            
            logger.info("J.A.R.V.I.S Enhanced System shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

# Create FastAPI app
app = FastAPI(
    title="J.A.R.V.I.S Enhanced API",
    description="Advanced AI Assistant with Full System Control",
    version="2.0.0",
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

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "J.A.R.V.I.S Enhanced API is online", "version": "2.0.0"}

@app.get("/api/status")
async def get_system_status():
    """Get comprehensive system status"""
    return {
        "system": "J.A.R.V.I.S Enhanced",
        "version": "2.0.0",
        "enhanced_mode": ENHANCED_MODE,
        "modules": {
            "brain": "online",
            "automation": "online",
            "stealth": "online",
            "security": security_manager.get_status() if hasattr(security_manager, 'get_status') else "online",
            "skills": skills_manager.get_status() if hasattr(skills_manager, 'get_status') else "online",
            "voice": voice_manager.get_status() if hasattr(voice_manager, 'get_status') else "online",
            "memory": "online",
            "copy_engine": "online",
            "evolution": "online"
        }
    }

# Authentication endpoints
@app.post("/api/authenticate")
async def authenticate(credentials: dict):
    """Authenticate user with biometric verification"""
    try:
        result = await security_manager.authenticate(credentials)
        return result
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@app.post("/api/register/start")
async def start_registration(user_data: dict):
    """Start user registration process"""
    try:
        username = user_data.get("username")
        if not username:
            raise HTTPException(status_code=400, detail="Username is required")
        
        result = await security_manager.start_registration(username)
        return result
    except Exception as e:
        logger.error(f"Registration start error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/register/face")
async def register_face_sample(request: Request):
    """Register face sample during enrollment"""
    try:
        form = await request.form()
        image_file = form.get("image")
        
        if not image_file:
            raise HTTPException(status_code=400, detail="No image file provided")
        
        image_data = await image_file.read()
        result = await security_manager.register_face_sample(image_data)
        return result
    except Exception as e:
        logger.error(f"Face registration error: {e}")
        raise HTTPException(status_code=500, detail="Face registration failed")

@app.post("/api/register/voice")
async def register_voice_sample(request: Request):
    """Register voice sample during enrollment"""
    try:
        form = await request.form()
        audio_file = form.get("audio")
        
        if not audio_file:
            raise HTTPException(status_code=400, detail="No audio file provided")
        
        audio_data = await audio_file.read()
        result = await security_manager.register_voice_sample(audio_data)
        return result
    except Exception as e:
        logger.error(f"Voice registration error: {e}")
        raise HTTPException(status_code=500, detail="Voice registration failed")

@app.post("/api/register/complete")
async def complete_registration():
    """Complete user registration process"""
    try:
        result = await security_manager.complete_registration()
        return result
    except Exception as e:
        logger.error(f"Registration completion error: {e}")
        raise HTTPException(status_code=500, detail="Registration completion failed")

@app.post("/api/authenticate/face")
async def authenticate_face(request: Request):
    """Authenticate user with face recognition"""
    try:
        form = await request.form()
        image_file = form.get("image")
        
        if not image_file:
            raise HTTPException(status_code=400, detail="No image file provided")
        
        image_data = await image_file.read()
        result = await security_manager.authenticate_face(image_data)
        return result
    except Exception as e:
        logger.error(f"Face authentication error: {e}")
        raise HTTPException(status_code=500, detail="Face authentication failed")

@app.post("/api/authenticate/voice")
async def authenticate_voice(request: Request):
    """Authenticate user with voice recognition"""
    try:
        form = await request.form()
        audio_file = form.get("audio")
        
        if not audio_file:
            raise HTTPException(status_code=400, detail="No audio file provided")
        
        audio_data = await audio_file.read()
        result = await security_manager.authenticate_voice(audio_data)
        return result
    except Exception as e:
        logger.error(f"Voice authentication error: {e}")
        raise HTTPException(status_code=500, detail="Voice authentication failed")

# Skills learning endpoints
@app.post("/api/skills/learn")
async def start_learning(request: dict):
    """Start learning a new skill"""
    try:
        topic = request.get("topic")
        user_id = request.get("user_id", "default")
        
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        result = await skills_manager.start_learning(topic, user_id)
        
        # Voice notification
        if result.get("success"):
            await voice_manager.speak_template("learning", {"topic": topic})
        
        return result
    except Exception as e:
        logger.error(f"Learning start error: {e}")
        raise HTTPException(status_code=500, detail="Learning failed")

@app.get("/api/skills/progress")
async def get_learning_progress(user_id: str = "default"):
    """Get current learning progress"""
    try:
        result = await skills_manager.get_learning_progress(user_id)
        return result
    except Exception as e:
        logger.error(f"Progress retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Progress retrieval failed")

@app.get("/api/skills/dashboard")
async def get_skills_dashboard():
    """Get comprehensive skills dashboard"""
    try:
        result = await skills_manager.get_skills_dashboard()
        return result
    except Exception as e:
        logger.error(f"Dashboard retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Dashboard retrieval failed")

@app.post("/api/skills/practice")
async def practice_skill(request: dict):
    """Practice an existing skill"""
    try:
        skill_id = request.get("skill_id")
        user_id = request.get("user_id", "default")
        
        if not skill_id:
            raise HTTPException(status_code=400, detail="Skill ID is required")
        
        result = await skills_manager.practice_skill(skill_id, user_id)
        return result
    except Exception as e:
        logger.error(f"Practice error: {e}")
        raise HTTPException(status_code=500, detail="Practice failed")

@app.post("/api/skills/complete")
async def complete_learning_session(request: dict):
    """Complete a learning session"""
    try:
        session_id = request.get("session_id")
        completion_rate = request.get("completion_rate", 0.0)
        feedback = request.get("feedback", "")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        
        result = await skills_manager.complete_learning_session(session_id, completion_rate, feedback)
        
        # Voice celebration for skill mastery
        if result.get("success") and result.get("new_level") == "expert":
            await voice_manager.celebrate_skill_mastery(
                result.get("skill_name"),
                result.get("new_level")
            )
        
        return result
    except Exception as e:
        logger.error(f"Session completion error: {e}")
        raise HTTPException(status_code=500, detail="Session completion failed")

@app.get("/api/skills/search")
async def search_skills(query: str):
    """Search for skills"""
    try:
        result = await skills_manager.search_skills(query)
        return {"results": result}
    except Exception as e:
        logger.error(f"Skill search error: {e}")
        raise HTTPException(status_code=500, detail="Skill search failed")

# Voice management endpoints
@app.post("/api/voice/speak")
async def speak_text(request: dict):
    """Make JARVIS speak text"""
    try:
        text = request.get("text")
        profile = request.get("profile")
        priority = request.get("priority", "normal")
        effects = request.get("effects", True)
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        result = await voice_manager.speak(text, profile, priority, effects)
        return result
    except Exception as e:
        logger.error(f"Speech error: {e}")
        raise HTTPException(status_code=500, detail="Speech failed")

@app.post("/api/voice/template")
async def speak_template(request: dict):
    """Make JARVIS speak using a template"""
    try:
        category = request.get("category")
        params = request.get("params", {})
        
        if not category:
            raise HTTPException(status_code=400, detail="Template category is required")
        
        result = await voice_manager.speak_template(category, params)
        return result
    except Exception as e:
        logger.error(f"Template speech error: {e}")
        raise HTTPException(status_code=500, detail="Template speech failed")

@app.get("/api/voice/profiles")
async def get_voice_profiles():
    """Get available voice profiles"""
    try:
        result = await voice_manager.get_voice_profiles()
        return result
    except Exception as e:
        logger.error(f"Voice profiles error: {e}")
        raise HTTPException(status_code=500, detail="Voice profiles retrieval failed")

@app.post("/api/voice/profile")
async def set_voice_profile(request: dict):
    """Set voice profile"""
    try:
        profile_name = request.get("profile_name")
        
        if not profile_name:
            raise HTTPException(status_code=400, detail="Profile name is required")
        
        result = await voice_manager.set_voice_profile(profile_name)
        return result
    except Exception as e:
        logger.error(f"Voice profile set error: {e}")
        raise HTTPException(status_code=500, detail="Voice profile setting failed")

@app.post("/api/voice/interrupt")
async def interrupt_speech():
    """Interrupt current speech"""
    try:
        result = await voice_manager.interrupt_speech()
        return result
    except Exception as e:
        logger.error(f"Speech interrupt error: {e}")
        raise HTTPException(status_code=500, detail="Speech interrupt failed")

# System control endpoints
@app.post("/api/command")
async def process_command(command: dict):
    try:
        result = await brain.process_command(command.get("command"), command.get("context"))
        return result
    except Exception as e:
        logger.error(f"Command processing error: {e}")
        raise HTTPException(status_code=500, detail="Command processing failed")

@app.post("/api/execute-task")
async def execute_complex_task(task: dict):
    """Execute complex automation task"""
    try:
        result = await automation.execute_task(task)
        return result
    except Exception as e:
        logger.error(f"Task execution error: {e}")
        raise HTTPException(status_code=500, detail="Task execution failed")

@app.get("/api/tasks")
async def list_tasks():
    """List active tasks"""
    try:
        result = await brain.list_active_tasks()
        return {"tasks": result}
    except Exception as e:
        logger.error(f"Task listing error: {e}")
        raise HTTPException(status_code=500, detail="Task listing failed")

@app.get("/api/tasks/{task_id}")
async def get_task_status(task_id: str):
    """Get task status"""
    try:
        result = await brain.get_task_status(task_id)
        return result
    except Exception as e:
        logger.error(f"Task status error: {e}")
        raise HTTPException(status_code=500, detail="Task status retrieval failed")

@app.delete("/api/tasks/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a task"""
    try:
        result = await brain.cancel_task(task_id)
        return result
    except Exception as e:
        logger.error(f"Task cancellation error: {e}")
        raise HTTPException(status_code=500, detail="Task cancellation failed")

@app.get("/api/memories")
async def get_memories():
    """Get stored memories"""
    try:
        result = await memory_manager.get_memories()
        return {"memories": result}
    except Exception as e:
        logger.error(f"Memory retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Memory retrieval failed")

@app.post("/api/memories")
async def create_memory(memory: dict):
    """Create new memory"""
    try:
        result = await memory_manager.create_memory(memory)
        return result
    except Exception as e:
        logger.error(f"Memory creation error: {e}")
        raise HTTPException(status_code=500, detail="Memory creation failed")

@app.post("/api/copy/create")
async def create_copy(copy_config: dict):
    """Create system copy"""
    try:
        result = await copy_engine.create_copy(copy_config)
        return result
    except Exception as e:
        logger.error(f"Copy creation error: {e}")
        raise HTTPException(status_code=500, detail="Copy creation failed")

@app.post("/api/stealth/activate")
async def activate_stealth(mode: dict):
    """Activate stealth mode"""
    try:
        mode_type = mode.get("mode", "exam")
        
        if mode_type == "exam":
            result = await stealth.activate_exam_mode()
        elif mode_type == "interview":
            result = await stealth.activate_interview_mode()
        elif mode_type == "copilot":
            result = await stealth.activate_passive_copilot()
        else:
            result = await stealth.activate_mode(mode_type)
        
        return result
    except Exception as e:
        logger.error(f"Stealth activation error: {e}")
        raise HTTPException(status_code=500, detail="Stealth activation failed")

@app.get("/api/stealth/answers")
async def get_stealth_answers():
    """Get current stealth answers"""
    try:
        result = await stealth.get_current_answers()
        return result
    except Exception as e:
        logger.error(f"Stealth answers error: {e}")
        raise HTTPException(status_code=500, detail="Stealth answers retrieval failed")

@app.post("/api/stealth/deactivate")
async def deactivate_stealth():
    """Deactivate stealth mode"""
    try:
        result = await stealth.deactivate()
        return result
    except Exception as e:
        logger.error(f"Stealth deactivation error: {e}")
        raise HTTPException(status_code=500, detail="Stealth deactivation failed")

@app.post("/api/evolution/trigger")
async def trigger_evolution():
    """Trigger system evolution"""
    try:
        result = await evolution_engine.trigger_evolution()
        return result
    except Exception as e:
        logger.error(f"Evolution trigger error: {e}")
        raise HTTPException(status_code=500, detail="Evolution trigger failed")

@app.post("/api/system/close-warning")
async def close_warning(request: dict):
    """Handle system close warning for learning in progress"""
    try:
        skill_name = request.get("skill_name", "Unknown skill")
        
        result = await voice_manager.notify_learning_interruption(skill_name)
        return result
    except Exception as e:
        logger.error(f"Close warning error: {e}")
        raise HTTPException(status_code=500, detail="Close warning failed")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)