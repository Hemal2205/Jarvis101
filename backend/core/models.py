from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class AuthMethod(str, Enum):
    FACE = "face"
    VOICE = "voice"
    BIOMETRIC = "biometric"

class SystemMode(str, Enum):
    FULL = "full"
    STEALTH_INTERVIEW = "stealth_interview"
    STEALTH_EXAM = "stealth_exam"
    PASSIVE_COPILOT = "passive_copilot"

class MemoryType(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    IMAGE = "image"
    EMOTION = "emotion"

class AuthenticationRequest(BaseModel):
    method: AuthMethod
    data: Dict[str, Any]
    user_id: str = "Hemal"

class CommandRequest(BaseModel):
    text: str
    mode: SystemMode = SystemMode.FULL
    context: Optional[Dict[str, Any]] = None

class Memory(BaseModel):
    id: Optional[str] = None
    type: MemoryType
    content: str
    emotion: Optional[str] = None
    timestamp: datetime = datetime.now()
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class CopyConfig(BaseModel):
    name: str
    target_user: str
    features: List[str]
    sanitize_personal_data: bool = True
    inherit_improvements: bool = True

class SystemStatus(BaseModel):
    brain_status: Dict[str, Any]
    security_status: Dict[str, Any]
    memory_status: Dict[str, Any]
    evolution_status: Dict[str, Any]
    uptime: float
    mode: SystemMode

class EvolutionMetrics(BaseModel):
    performance_score: float
    improvement_suggestions: List[str]
    last_evolution: Optional[datetime] = None
    evolution_count: int = 0