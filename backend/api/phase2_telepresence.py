from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/telepresence", tags=["telepresence"])

class Room(BaseModel):
    id: str
    name: str
    type: str
    participants: List[str]
    active: bool

class PresenceUser(BaseModel):
    id: str
    name: str
    status: str

class MeetingSummary(BaseModel):
    id: str
    room: str
    date: str
    summary: str
    action_items: List[str]
    highlights: List[str]

class ActivityEvent(BaseModel):
    id: str
    type: str
    user: str
    description: str
    timestamp: str

class ChatMessage(BaseModel):
    id: str
    room_id: str
    user: str
    message: str
    timestamp: str

class ScreenSharingState(BaseModel):
    room_id: str
    user: str
    is_sharing: bool
    started_at: Optional[str] = None
    stopped_at: Optional[str] = None

# Mock data
mock_rooms = [
    Room(id='r1', name='Daily Standup', type='video', participants=['Alice', 'Bob'], active=True),
    Room(id='r2', name='Design Review', type='audio', participants=['Carol'], active=False)
]
mock_users = [
    PresenceUser(id='u1', name='Alice', status='in_call'),
    PresenceUser(id='u2', name='Bob', status='in_call'),
    PresenceUser(id='u3', name='Carol', status='online'),
    PresenceUser(id='u4', name='Dave', status='offline')
]
mock_summaries = [
    MeetingSummary(id='s1', room='Daily Standup', date='2024-06-01', summary='Discussed project progress and blockers.', action_items=['Finish VR UI', 'Review PR #42'], highlights=['Alice demoed new feature', 'Bob fixed bug'])
]
mock_activity = [
    ActivityEvent(id='a1', type='call_start', user='Alice', description='started a call in Daily Standup', timestamp='2024-06-01T10:00:00Z'),
    ActivityEvent(id='a2', type='join', user='Bob', description='joined Daily Standup', timestamp='2024-06-01T10:01:00Z')
]
mock_alerts = [
    'Screen sharing is not available in your browser.',
    'Carol is waiting in Design Review.'
]

# Mock chat and screen sharing state
mock_chat_messages = [
    ChatMessage(id='c1', room_id='r1', user='Alice', message='Hello, team!', timestamp='2024-06-01T10:02:00Z'),
    ChatMessage(id='c2', room_id='r1', user='Bob', message='Hi Alice!', timestamp='2024-06-01T10:02:10Z')
]
mock_screen_sharing = {
    'r1': ScreenSharingState(room_id='r1', user='Alice', is_sharing=True, started_at='2024-06-01T10:05:00Z'),
    'r2': ScreenSharingState(room_id='r2', user='', is_sharing=False)
}

@router.get('/rooms')
def get_rooms():
    return {"success": True, "rooms": [r.dict() for r in mock_rooms]}

@router.get('/users')
def get_users():
    return {"success": True, "users": [u.dict() for u in mock_users]}

@router.get('/summaries')
def get_summaries():
    return {"success": True, "summaries": [s.dict() for s in mock_summaries]}

@router.get('/activity')
def get_activity():
    return {"success": True, "activity": [a.dict() for a in mock_activity]}

@router.get('/alerts')
def get_alerts():
    return {"success": True, "alerts": mock_alerts}

@router.get('/chat')
def get_chat(room_id: str):
    messages = [m.dict() for m in mock_chat_messages if m.room_id == room_id]
    return {"success": True, "messages": messages}

@router.post('/chat')
def post_chat(message: ChatMessage):
    mock_chat_messages.append(message)
    return {"success": True, "message": message.dict()}

@router.get('/screen-sharing')
def get_screen_sharing(room_id: str):
    state = mock_screen_sharing.get(room_id)
    return {"success": True, "state": state.dict() if state else None}

@router.post('/screen-sharing')
def post_screen_sharing(state: ScreenSharingState):
    mock_screen_sharing[state.room_id] = state
    return {"success": True, "state": state.dict()} 