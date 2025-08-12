import asyncio
import json
import logging
import aiofiles
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
import os
from sqlalchemy.orm import Session
from .models import Memory as MemoryModel, User as UserModel
from .notification_manager import NotificationManager

logger = logging.getLogger(__name__)

notification_manager = NotificationManager()

class MemoryVault:
    """Enhanced memory management system for J.A.R.V.I.S (SQLAlchemy version)"""
    
    def __init__(self):
        pass  # No in-memory or file-based storage
    
    async def initialize(self, db: Session):
        """Initialize the memory vault asynchronously"""
        # No initialization needed for file-based storage
        pass
    
    def get_status(self, db: Session) -> Dict[str, Any]:
        """Get memory vault status"""
        total_memories = db.query(MemoryModel).count()
        emotional_entries = db.query(MemoryModel).count() # Assuming all memories are journal entries for now
        memory_types = db.query(MemoryModel.type).distinct().all()
        emotions_detected = db.query(MemoryModel.emotion).distinct().all()
        users_with_memories = db.query(UserModel.username).distinct().count()
        storage_size = "N/A (SQLAlchemy)" # No direct file size in SQLAlchemy
        return {
            "total_memories": total_memories,
            "emotional_entries": emotional_entries,
            "memory_types": [t[0] for t in memory_types],
            "emotions_detected": [e[0] for e in emotions_detected],
            "users_with_memories": users_with_memories,
            "storage_size": storage_size
        }
    
    async def create_memory(self, db: Session, memory_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create and store a new memory"""
        try:
            user = db.query(UserModel).filter_by(username=memory_data.get("user", "Hemal")).first()
            if not user:
                return {"success": False, "error": "User not found"}
            memory = MemoryModel(
                user_id=user.id,
                type=memory_data.get("type", "text"),
                content=memory_data.get("content", ""),
                emotion=memory_data.get("emotion"),
                timestamp=datetime.now(),
                extra_data={
                    "importance": memory_data.get("importance"),
                    "tags": memory_data.get("tags", []),
                    "access_count": 0,
                    "last_accessed": None
                }
            )
            db.add(memory)
            db.commit()
            db.refresh(memory)
            # Create notification for new memory
            notification_manager.create_notification(
                db,
                user_id=user.id,
                message=f'New memory added: {memory.content[:40]}',
                type="memory",
                data={"memory_id": memory.id, "memory_type": memory.type}
            )
            return {"success": True, "memory_id": memory.id, "memory": {
                "id": memory.id,
                "content": memory.content,
                "type": memory.type,
                "user": user.username,
                "timestamp": memory.timestamp.isoformat(),
                "emotion": memory.emotion,
                "importance": memory.extra_data.get("importance"),
                "tags": memory.extra_data.get("tags", []),
                "access_count": memory.extra_data.get("access_count", 0),
                "last_accessed": memory.extra_data.get("last_accessed")
            }}
        except Exception as e:
            logger.error(f"Memory creation failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_memories(self, db: Session, user: str = "Hemal", limit: int = 50) -> List[Dict[str, Any]]:
        """Get memories for a user"""
        try:
            user_obj = db.query(UserModel).filter_by(username=user).first()
            if not user_obj:
                return []
            memories = db.query(MemoryModel).filter_by(user_id=user_obj.id).order_by(MemoryModel.timestamp.desc()).limit(limit).all()
            result = []
            for memory in memories:
                # Optionally update access_count and last_accessed
                extra_data = memory.extra_data or {}
                extra_data["access_count"] = extra_data.get("access_count", 0) + 1
                extra_data["last_accessed"] = datetime.now().isoformat()
                memory.extra_data = extra_data
                db.commit()
                result.append({
                    "id": memory.id,
                    "content": memory.content,
                    "type": memory.type,
                    "user": user_obj.username,
                    "timestamp": memory.timestamp.isoformat(),
                    "emotion": memory.emotion,
                    "importance": extra_data.get("importance"),
                    "tags": extra_data.get("tags", []),
                    "access_count": extra_data.get("access_count", 0),
                    "last_accessed": extra_data.get("last_accessed")
                })
            return result
        except Exception as e:
            logger.error(f"Failed to get memories: {e}")
            return []
    
    async def search_memories(self, db: Session, query: str, user: str = "Hemal") -> List[Dict[str, Any]]:
        """Search memories by content, tags, or emotion"""
        try:
            matching_memories = []
            query_lower = query.lower()
            
            user_obj = db.query(UserModel).filter_by(username=user).first()
            if not user_obj:
                return []

            memories = db.query(MemoryModel).filter_by(user_id=user_obj.id).all()

            for memory in memories:
                # Search in content
                if query_lower in memory.content.lower():
                    matching_memories.append(memory)
                # Search in tags
                elif any(query_lower in tag.lower() for tag in memory.extra_data.get("tags", [])):
                    matching_memories.append(memory)
                # Search by emotion
                elif query_lower == memory.emotion.lower():
                    matching_memories.append(memory)
            
            # Sort by importance and recency
            matching_memories.sort(
                key=lambda x: (x.extra_data.get("importance", 0), x.timestamp), 
                reverse=True
            )
            
            return [{
                "id": m.id,
                "content": m.content,
                "type": m.type,
                "user": user_obj.username,
                "timestamp": m.timestamp.isoformat(),
                "emotion": m.emotion,
                "importance": m.extra_data.get("importance"),
                "tags": m.extra_data.get("tags", []),
                "access_count": m.extra_data.get("access_count", 0),
                "last_accessed": m.extra_data.get("last_accessed")
            } for m in matching_memories]
            
        except Exception as e:
            logger.error(f"Memory search failed: {e}")
            return []
    
    async def _analyze_emotion(self, content: str) -> str:
        """Analyze emotion from memory content using enhanced NLP"""
        content_lower = content.lower()
        
        # Enhanced emotion detection
        emotion_keywords = {
            'joy': ['happy', 'joy', 'excited', 'thrilled', 'delighted', 'cheerful', 'elated'],
            'love': ['love', 'adore', 'cherish', 'treasure', 'affection', 'care'],
            'pride': ['proud', 'accomplished', 'achieved', 'success', 'victory'],
            'gratitude': ['grateful', 'thankful', 'appreciate', 'blessed'],
            'sadness': ['sad', 'disappointed', 'upset', 'heartbroken', 'melancholy'],
            'anger': ['angry', 'frustrated', 'mad', 'annoyed', 'furious'],
            'fear': ['scared', 'afraid', 'worried', 'anxious', 'nervous'],
            'surprise': ['surprised', 'amazed', 'shocked', 'astonished'],
            'peaceful': ['peaceful', 'calm', 'relaxed', 'serene', 'tranquil'],
            'nostalgic': ['remember', 'nostalgia', 'past', 'childhood', 'memories']
        }
        
        emotion_scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        if emotion_scores:
            return max(emotion_scores, key=emotion_scores.get)
        else:
            return 'neutral'
    
    async def _calculate_importance(self, content: str) -> float:
        """Calculate importance score for memory using advanced metrics"""
        importance = 0.5  # Base importance
        
        # Length factor
        if len(content) > 200:
            importance += 0.2
        elif len(content) > 100:
            importance += 0.1
        
        # Important keywords
        important_keywords = {
            'family': 0.3,
            'work': 0.2,
            'achievement': 0.3,
            'milestone': 0.3,
            'decision': 0.2,
            'learning': 0.2,
            'travel': 0.2,
            'health': 0.3,
            'relationship': 0.3,
            'goal': 0.2
        }
        
        content_lower = content.lower()
        for keyword, weight in important_keywords.items():
            if keyword in content_lower:
                importance += weight
        
        # Emotional intensity
        emotional_words = ['amazing', 'incredible', 'terrible', 'wonderful', 'devastating', 'fantastic']
        for word in emotional_words:
            if word in content_lower:
                importance += 0.1
        
        return min(importance, 1.0)
    
    async def _extract_tags(self, content: str) -> List[str]:
        """Extract relevant tags from memory content"""
        tags = []
        content_lower = content.lower()
        
        # Enhanced tag extraction
        tag_patterns = {
            'work': ['work', 'job', 'career', 'project', 'meeting', 'office', 'colleague'],
            'family': ['family', 'mom', 'dad', 'sister', 'brother', 'parent', 'child'],
            'friends': ['friend', 'buddy', 'pal', 'companion'],
            'achievement': ['achievement', 'success', 'accomplished', 'goal', 'milestone'],
            'learning': ['learned', 'study', 'course', 'education', 'knowledge', 'skill'],
            'travel': ['travel', 'trip', 'vacation', 'visit', 'journey', 'adventure'],
            'health': ['health', 'exercise', 'workout', 'medical', 'doctor', 'fitness'],
            'hobby': ['hobby', 'interest', 'passion', 'creative', 'art', 'music'],
            'food': ['food', 'restaurant', 'cooking', 'meal', 'dinner', 'lunch'],
            'technology': ['technology', 'computer', 'software', 'app', 'digital'],
            'nature': ['nature', 'outdoor', 'park', 'beach', 'mountain', 'forest']
        }
        
        for tag, keywords in tag_patterns.items():
            if any(keyword in content_lower for keyword in keywords):
                tags.append(tag)
        
        return tags
    
    async def _update_memory_index(self, memory: Dict[str, Any]):
        """Update memory search index for faster retrieval"""
        # This method is no longer needed as all data is in the database
        pass
    
    async def _add_journal_entry(self, entry: str):
        """Add entry to J.A.R.V.I.S's emotional journal"""
        # This method is no longer needed as all data is in the database
        pass
    
    async def _load_memories(self):
        """Load memories from storage"""
        pass
    
    async def _save_memories(self):
        """Save memories to storage"""
        pass
    
    async def _load_emotional_journal(self):
        """Load emotional journal from storage"""
        pass
    
    async def _save_emotional_journal(self):
        """Save emotional journal to storage"""
        pass