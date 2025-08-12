from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/api/ai/models/status")
async def get_models_status():
    models = [
        {
            "name": "Nous Hermes",
            "role": "Reasoning",
            "status": "active",
            "load": 75,
            "color": "from-purple-400 to-pink-500"
        },
        {
            "name": "Dolphin-Phi-2",
            "role": "Command Parser",
            "status": "active",
            "load": 45,
            "color": "from-blue-400 to-cyan-500"
        },
        {
            "name": "Qwen2.5 Coder",
            "role": "Code Generation",
            "status": "active",
            "load": 60,
            "color": "from-green-400 to-emerald-500"
        }
    ]
    return JSONResponse({"models": models}) 