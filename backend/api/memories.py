from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from core.db import get_db
from core.models import Memory, User
from datetime import datetime

router = APIRouter()

@router.get("/api/memories")
async def get_memories(user_id: int = 1, db: Session = Depends(get_db)):
    """Get all memories for a user"""
    try:
        memories = db.query(Memory).filter(
            Memory.user_id == user_id
        ).order_by(desc(Memory.timestamp)).limit(100).all()
        
        return JSONResponse({
            "success": True,
            "memories": [
                {
                    "id": m.id,
                    "type": m.type,
                    "content": m.content,
                    "emotion": m.emotion,
                    "timestamp": m.timestamp.isoformat() if m.timestamp else None,
                    "extra_data": m.extra_data
                } for m in memories
            ],
            "total_count": len(memories)
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve memories"
        }, status_code=500)

@router.post("/api/memories")
async def add_memory(request: dict, db: Session = Depends(get_db)):
    """Add a new memory"""
    try:
        user_id = request.get("user_id", 1)
        memory_type = request.get("type", "text")
        content = request.get("content")
        emotion = request.get("emotion")
        extra_data = request.get("extra_data", {})
        
        if not content:
            return JSONResponse({
                "success": False,
                "message": "Content is required"
            }, status_code=400)
        
        # Create new memory
        memory = Memory(
            user_id=user_id,
            type=memory_type,
            content=content,
            emotion=emotion,
            timestamp=datetime.now(),
            extra_data=extra_data
        )
        
        db.add(memory)
        db.commit()
        db.refresh(memory)
        
        return JSONResponse({
            "success": True,
            "message": "Memory added successfully",
            "memory": {
                "id": memory.id,
                "type": memory.type,
                "content": memory.content,
                "emotion": memory.emotion,
                "timestamp": memory.timestamp.isoformat()
            }
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to add memory"
        }, status_code=500)

@router.delete("/api/memories/{memory_id}")
async def delete_memory(memory_id: int, db: Session = Depends(get_db)):
    """Delete a specific memory"""
    try:
        memory = db.query(Memory).filter(Memory.id == memory_id).first()
        
        if not memory:
            return JSONResponse({
                "success": False,
                "message": "Memory not found"
            }, status_code=404)
        
        db.delete(memory)
        db.commit()
        
        return JSONResponse({
            "success": True,
            "message": "Memory deleted successfully"
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to delete memory"
        }, status_code=500)

@router.get("/api/memories/search")
async def search_memories(query: str, user_id: int = 1, db: Session = Depends(get_db)):
    """Search memories by content"""
    try:
        memories = db.query(Memory).filter(
            Memory.user_id == user_id,
            Memory.content.contains(query)
        ).order_by(desc(Memory.timestamp)).limit(50).all()
        
        return JSONResponse({
            "success": True,
            "memories": [
                {
                    "id": m.id,
                    "type": m.type,
                    "content": m.content,
                    "emotion": m.emotion,
                    "timestamp": m.timestamp.isoformat() if m.timestamp else None
                } for m in memories
            ],
            "query": query,
            "total_count": len(memories)
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to search memories"
        }, status_code=500)
