import asyncio
import json
import logging
import aiofiles
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
import os

logger = logging.getLogger(__name__)

class MemoryVault:
    """Enhanced memory management system for J.A.R.V.I.S"""
    
    def __init__(self):
        self.memories = {}
        self.memory_index = {}
        self.emotional_journal = []
        self.memory_dir = "data/memory"
        self.backup_dir = "data/backups"
        
        # Ensure directories exist
        os.makedirs(self.memory_dir, exist_ok=True)
        os.makedirs(self.backup_dir, exist_ok=True)
    
    async def initialize(self):
        """Initialize the memory vault asynchronously"""
        await self._load_memories()
        await self._load_emotional_journal()
    
    def get_status(self) -> Dict[str, Any]:
        """Get memory vault status"""
        return {
            "total_memories": len(self.memories),
            "emotional_entries": len(self.emotional_journal),
            "memory_types": self._get_memory_types(),
            "emotions_detected": self._get_emotions(),
            "users_with_memories": len(set(m.get('user', 'unknown') for m in self.memories.values())),
            "storage_size": self._calculate_storage_size()
        }
    
    def _get_memory_types(self) -> List[str]:
        """Get unique memory types"""
        return list(set(m.get('type', 'unknown') for m in self.memories.values()))
    
    def _get_emotions(self) -> List[str]:
        """Get unique emotions detected"""
        return list(set(m.get('emotion', 'neutral') for m in self.memories.values()))
    
    def _calculate_storage_size(self) -> str:
        """Calculate approximate storage size"""
        total_chars = sum(len(str(memory)) for memory in self.memories.values())
        size_kb = total_chars / 1024
        return f"{size_kb:.2f} KB"
    
    async def create_memory(self, memory_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create and store a new memory"""
        try:
            memory_id = str(uuid.uuid4())
            
            # Extract memory details
            content = memory_data.get("content", "")
            memory_type = memory_data.get("type", "text")
            user = memory_data.get("user", "Hemal")
            
            # Analyze emotion
            emotion = await self._analyze_emotion(content)
            
            # Calculate importance
            importance = await self._calculate_importance(content)
            
            # Extract tags
            tags = await self._extract_tags(content)
            
            # Create memory object
            memory = {
                "id": memory_id,
                "content": content,
                "type": memory_type,
                "user": user,
                "timestamp": datetime.now().isoformat(),
                "emotion": emotion,
                "importance": importance,
                "tags": tags,
                "access_count": 0,
                "last_accessed": None
            }
            
            # Store memory
            self.memories[memory_id] = memory
            
            # Update index
            await self._update_memory_index(memory)
            
            # Save to storage
            await self._save_memories()
            
            # Add to emotional journal
            await self._add_journal_entry(f"New memory recorded: {content[:100]}...")
            
            logger.info(f"Memory created: {memory_id}")
            
            return {
                "success": True,
                "memory_id": memory_id,
                "memory": memory
            }
            
        except Exception as e:
            logger.error(f"Memory creation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_memories(self, user: str = "Hemal", limit: int = 50) -> List[Dict[str, Any]]:
        """Get memories for a user"""
        try:
            user_memories = []
            
            for memory in self.memories.values():
                if memory.get("user") == user:
                    # Update access count
                    memory["access_count"] = memory.get("access_count", 0) + 1
                    memory["last_accessed"] = datetime.now().isoformat()
                    user_memories.append(memory)
            
            # Sort by timestamp (newest first)
            user_memories.sort(key=lambda x: x["timestamp"], reverse=True)
            
            # Apply limit
            return user_memories[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get memories: {e}")
            return []
    
    async def search_memories(self, query: str, user: str = "Hemal") -> List[Dict[str, Any]]:
        """Search memories by content, tags, or emotion"""
        try:
            matching_memories = []
            query_lower = query.lower()
            
            for memory in self.memories.values():
                if memory.get("user") == user:
                    # Search in content
                    if query_lower in memory.get("content", "").lower():
                        matching_memories.append(memory)
                    # Search in tags
                    elif any(query_lower in tag.lower() for tag in memory.get("tags", [])):
                        matching_memories.append(memory)
                    # Search by emotion
                    elif query_lower == memory.get("emotion", "").lower():
                        matching_memories.append(memory)
            
            # Sort by importance and recency
            matching_memories.sort(
                key=lambda x: (x.get("importance", 0), x["timestamp"]), 
                reverse=True
            )
            
            return matching_memories
            
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
        try:
            user = memory["user"]
            if user not in self.memory_index:
                self.memory_index[user] = {
                    "by_date": {},
                    "by_emotion": {},
                    "by_tags": {},
                    "by_importance": {}
                }
            
            # Index by date
            date_key = memory["timestamp"][:10]  # YYYY-MM-DD
            if date_key not in self.memory_index[user]["by_date"]:
                self.memory_index[user]["by_date"][date_key] = []
            self.memory_index[user]["by_date"][date_key].append(memory["id"])
            
            # Index by emotion
            emotion = memory["emotion"]
            if emotion not in self.memory_index[user]["by_emotion"]:
                self.memory_index[user]["by_emotion"][emotion] = []
            self.memory_index[user]["by_emotion"][emotion].append(memory["id"])
            
            # Index by tags
            for tag in memory["tags"]:
                if tag not in self.memory_index[user]["by_tags"]:
                    self.memory_index[user]["by_tags"][tag] = []
                self.memory_index[user]["by_tags"][tag].append(memory["id"])
            
        except Exception as e:
            logger.error(f"Failed to update memory index: {e}")
    
    async def _add_journal_entry(self, entry: str):
        """Add entry to J.A.R.V.I.S's emotional journal"""
        try:
            journal_entry = {
                "id": str(uuid.uuid4()),
                "entry": entry,
                "timestamp": datetime.now().isoformat(),
                "emotion": await self._analyze_emotion(entry)
            }
            
            self.emotional_journal.append(journal_entry)
            
            # Keep only last 1000 entries
            if len(self.emotional_journal) > 1000:
                self.emotional_journal = self.emotional_journal[-1000:]
            
            await self._save_emotional_journal()
            
        except Exception as e:
            logger.error(f"Failed to add journal entry: {e}")
    
    async def _load_memories(self):
        """Load memories from storage"""
        try:
            memories_file = os.path.join(self.memory_dir, "memories.json")
            if os.path.exists(memories_file):
                async with aiofiles.open(memories_file, 'r') as f:
                    content = await f.read()
                    self.memories = json.loads(content)
                logger.info(f"Loaded {len(self.memories)} memories")
            else:
                self.memories = {}
                logger.info("No existing memories found")
        except Exception as e:
            logger.error(f"Failed to load memories: {e}")
            self.memories = {}
    
    async def _save_memories(self):
        """Save memories to storage"""
        try:
            memories_file = os.path.join(self.memory_dir, "memories.json")
            async with aiofiles.open(memories_file, 'w') as f:
                content = json.dumps(self.memories, indent=2)
                await f.write(content)
            logger.info("Memories saved")
        except Exception as e:
            logger.error(f"Failed to save memories: {e}")
    
    async def _load_emotional_journal(self):
        """Load emotional journal from storage"""
        try:
            journal_file = os.path.join(self.memory_dir, "emotional_journal.json")
            if os.path.exists(journal_file):
                async with aiofiles.open(journal_file, 'r') as f:
                    content = await f.read()
                    self.emotional_journal = json.loads(content)
                logger.info(f"Loaded {len(self.emotional_journal)} journal entries")
            else:
                self.emotional_journal = []
                logger.info("No existing journal entries found")
        except Exception as e:
            logger.error(f"Failed to load emotional journal: {e}")
            self.emotional_journal = []
    
    async def _save_emotional_journal(self):
        """Save emotional journal to storage"""
        try:
            journal_file = os.path.join(self.memory_dir, "emotional_journal.json")
            async with aiofiles.open(journal_file, 'w') as f:
                content = json.dumps(self.emotional_journal, indent=2)
                await f.write(content)
            logger.info("Emotional journal saved")
        except Exception as e:
            logger.error(f"Failed to save emotional journal: {e}")