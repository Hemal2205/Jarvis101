from fastapi import APIRouter
from fastapi.responses import JSONResponse
import random
import time

router = APIRouter()

@router.get("/api/copy/history")
async def get_copy_history():
    # Simulate a list of copy history
    history = [
        {
            "id": str(i),
            "name": f"Copy {i}",
            "created": time.time() - i * 3600,
            "status": random.choice(["active", "disabled"]),
            "owner": "user1"
        }
        for i in range(random.randint(1, 5))
    ]
    return JSONResponse({"history": history})

@router.get("/api/copy/templates")
async def get_copy_templates():
    """
    Get available copy templates for creating system copies.
    This endpoint returns a list of predefined templates that users can use
    to create copies of their JARVIS system with different configurations.
    """
    # Predefined copy templates with different configurations
    templates = [
        {
            "id": "basic-assistant",
            "name": "Basic AI Assistant",
            "description": "A simplified JARVIS copy with core AI capabilities",
            "category": "productivity",
            "features": [
                "Text processing",
                "Basic voice commands",
                "Simple task management",
                "Weather updates"
            ],
            "requirements": {
                "memory": "2GB",
                "storage": "500MB",
                "cpu": "Dual-core"
            },
            "estimated_setup_time": "5 minutes",
            "difficulty": "beginner",
            "icon": "🤖"
        },
        {
            "id": "stealth-mode",
            "name": "Stealth Assistant",
            "description": "Specialized copy for exam and interview assistance",
            "category": "education",
            "features": [
                "Screen analysis",
                "Real-time suggestions",
                "Invisible operation",
                "Question detection",
                "Smart responses"
            ],
            "requirements": {
                "memory": "4GB",
                "storage": "1GB",
                "cpu": "Quad-core"
            },
            "estimated_setup_time": "15 minutes",
            "difficulty": "advanced",
            "icon": "🥷"
        },
        {
            "id": "automation-specialist",
            "name": "Automation Specialist",
            "description": "Advanced copy focused on system automation and control",
            "category": "automation",
            "features": [
                "System automation",
                "Browser control",
                "File operations",
                "Application management",
                "Scheduled tasks"
            ],
            "requirements": {
                "memory": "6GB",
                "storage": "2GB",
                "cpu": "Hexa-core"
            },
            "estimated_setup_time": "25 minutes",
            "difficulty": "expert",
            "icon": "⚙️"
        },
        {
            "id": "learning-companion",
            "name": "Learning Companion",
            "description": "Educational copy with tutoring and skill development features",
            "category": "education",
            "features": [
                "Personalized tutoring",
                "Skill tracking",
                "Progress analytics",
                "Interactive learning",
                "Study reminders"
            ],
            "requirements": {
                "memory": "3GB",
                "storage": "1.5GB",
                "cpu": "Quad-core"
            },
            "estimated_setup_time": "12 minutes",
            "difficulty": "intermediate",
            "icon": "📚"
        },
        {
            "id": "smart-home",
            "name": "Smart Home Controller",
            "description": "IoT-focused copy for home automation and device management",
            "category": "iot",
            "features": [
                "Device control",
                "Environment monitoring",
                "Energy optimization",
                "Security management",
                "Routine automation"
            ],
            "requirements": {
                "memory": "4GB",
                "storage": "1.2GB",
                "cpu": "Quad-core"
            },
            "estimated_setup_time": "20 minutes",
            "difficulty": "intermediate",
            "icon": "🏠"
        },
        {
            "id": "developer-assistant",
            "name": "Developer Assistant",
            "description": "Code-focused copy with development tools and AI coding support",
            "category": "development",
            "features": [
                "Code generation",
                "Debug assistance",
                "Documentation help",
                "Git integration",
                "Performance analysis"
            ],
            "requirements": {
                "memory": "8GB",
                "storage": "3GB",
                "cpu": "Octa-core"
            },
            "estimated_setup_time": "30 minutes",
            "difficulty": "expert",
            "icon": "💻"
        }
    ]
    
    return JSONResponse({"templates": templates})
