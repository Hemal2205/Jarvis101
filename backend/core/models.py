from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON, LargeBinary
from sqlalchemy.orm import relationship
from core.db import Base  # Import Base from core.db

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

class MemorySchema(BaseModel):
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

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(128), unique=True)
    password_hash = Column(String(128))
    avatar_url = Column(String(256), nullable=True)  # Add avatar_url field
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    memories = relationship('Memory', back_populates='user')
    skills = relationship('Skill', back_populates='user')
    notifications = relationship('Notification', back_populates='user')
    tasks = relationship('Task', back_populates='user')
    face = relationship('Face', back_populates='user', uselist=False, foreign_keys='Face.user_id')
    voice = relationship('Voice', back_populates='user', uselist=False, foreign_keys='Voice.user_id')

class Face(Base):
    __tablename__ = 'faces'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    encoding = Column(LargeBinary)  # Store face encoding as binary
    image = Column(LargeBinary)     # Store face image as binary (BLOB)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='face', foreign_keys=[user_id])

class Voice(Base):
    __tablename__ = 'voices'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    model = Column(LargeBinary)     # Store voice model as binary
    samples = Column(LargeBinary)   # Store raw audio samples as binary
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='voice', foreign_keys=[user_id])

class Memory(Base):
    __tablename__ = 'memories'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    type = Column(String(16))  # text, voice, image, video
    content = Column(Text)     # For text, or path/URL for media
    emotion = Column(String(32))
    timestamp = Column(DateTime, default=datetime.utcnow)
    extra_data = Column(JSON)
    user = relationship('User', back_populates='memories')

class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String(128), nullable=False)
    description = Column(Text)
    category = Column(String(64))
    level = Column(String(32))
    mastery_score = Column(Float)
    resources = Column(JSON)  # List of URLs, docs, etc.
    last_updated = Column(DateTime, default=datetime.utcnow)
    learned_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='skills')

class Video(Base):
    __tablename__ = 'videos'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    file_path = Column(String(256))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User')

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    description = Column(Text)
    status = Column(String(32))
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    user = relationship('User', back_populates='tasks')

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    message = Column(Text)
    type = Column(String(32), default='general')  # e.g., 'collaboration', 'assignment', 'status', 'consensus', etc.
    data = Column(JSON, nullable=True)  # Extra payload (e.g., suggestion_id, agent info)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='notifications')

class EvolutionLog(Base):
    __tablename__ = 'evolution_logs'
    id = Column(Integer, primary_key=True)
    version = Column(String(32))
    description = Column(Text)
    changes = Column(JSON)
    status = Column(String(32))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

class LearningSession(Base):
    __tablename__ = 'learning_sessions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    skill_id = Column(Integer, ForeignKey('skills.id'))
    topic = Column(String(256))
    duration = Column(Integer)  # in minutes
    content_learned = Column(JSON)
    questions_asked = Column(JSON)
    practice_exercises = Column(JSON)
    completion_rate = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    feedback = Column(Text)
    user = relationship('User')
    skill = relationship('Skill')

class UserSettings(Base):
    __tablename__ = 'user_settings'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    enable_google_calendar = Column(Boolean, default=True)
    enable_outlook_calendar = Column(Boolean, default=True)
    enable_meeting_reminders = Column(Boolean, default=True)
    enable_app_suggestions = Column(Boolean, default=True)
    notification_mode = Column(String(32), default='toast')  # 'toast', 'modal', 'sound', 'push'
    notification_preferences = Column(JSON, default={})  # e.g., {"system_alert":"toast","reminder":"push"}
    openai_api_key = Column(String(128), nullable=True)
    gemini_api_key = Column(String(128), nullable=True)
    llm_model_preference = Column(String(64), nullable=True)  # e.g., 'openai_gpt4', 'gemini', etc.
    daily_goal = Column(String(256), nullable=True)
    focus_block = Column(JSON, nullable=True)  # e.g., {"start": ..., "end": ..., "duration": ...}
    break_block = Column(JSON, nullable=True)  # e.g., {"start": ..., "end": ..., "duration": ...}
    user = relationship('User')

class Device(Base):
    __tablename__ = 'devices'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    device_type = Column(String(16))  # 'android', 'ios', 'web'
    push_token = Column(String(256))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', backref='devices')

class AutonomousAgent(Base):
    __tablename__ = 'autonomous_agents'
    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False)
    status = Column(String(32), default='idle')
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime)
    current_task = Column(String(256), nullable=True)
    avatar_url = Column(String(256), nullable=True)  # New: agent avatar
    role = Column(String(64), nullable=True)        # New: agent role
    tasks = relationship('AutonomousAgentTask', back_populates='agent')

class AutonomousAgentTask(Base):
    __tablename__ = 'autonomous_agent_tasks'
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey('autonomous_agents.id'))
    description = Column(Text)
    status = Column(String(32), default='pending')
    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    result = Column(Text, nullable=True)
    agent = relationship('AutonomousAgent', back_populates='tasks')

class EvolutionSuggestion(Base):
    __tablename__ = 'evolution_suggestions'
    id = Column(Integer, primary_key=True)
    agent_id = Column(Integer, ForeignKey('autonomous_agents.id'), nullable=True)
    assigned_agent_id = Column(Integer, ForeignKey('autonomous_agents.id'), nullable=True)  # New: assigned agent
    type = Column(String(64))
    description = Column(Text)
    status = Column(String(32), default='pending')  # pending, applied, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

class EvolutionHistory(Base):
    __tablename__ = 'evolution_history'
    id = Column(Integer, primary_key=True)
    suggestion_id = Column(Integer, ForeignKey('evolution_suggestions.id'))
    action = Column(String(32))  # applied, rejected
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text)

class EvolutionSuggestionCollaboration(Base):
    __tablename__ = 'evolution_suggestion_collaborations'
    id = Column(Integer, primary_key=True)
    suggestion_id = Column(Integer, ForeignKey('evolution_suggestions.id'))
    agent_id = Column(Integer, ForeignKey('autonomous_agents.id'))
    action = Column(String(32))  # endorse, comment, vote, reject, apply
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    suggestion = relationship('EvolutionSuggestion', backref='collaborations')
    agent = relationship('AutonomousAgent')

class SuggestionMessage(Base):
    __tablename__ = 'suggestion_messages'
    id = Column(Integer, primary_key=True)
    suggestion_id = Column(Integer, ForeignKey('evolution_suggestions.id'))
    agent_id = Column(Integer, ForeignKey('autonomous_agents.id'))
    parent_id = Column(Integer, ForeignKey('suggestion_messages.id'), nullable=True)
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    suggestion = relationship('EvolutionSuggestion', backref='messages')
    agent = relationship('AutonomousAgent')
    parent = relationship('SuggestionMessage', remote_side=[id], backref='replies')
