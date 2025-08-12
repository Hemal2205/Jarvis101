from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

router = APIRouter(prefix="/api/collab", tags=["collaboration"])

# Models
class Collaborator(BaseModel):
    id: str
    name: str
    status: str
    role: str
    last_active: str

class Document(BaseModel):
    id: str
    title: str
    content: str
    updated_at: str
    collaborators: List[str]

class BoardTask(BaseModel):
    id: str
    content: str
    status: str
    assignees: List[str]
    due_date: Optional[str] = None

class Board(BaseModel):
    id: str
    title: str
    tasks: List[BoardTask]
    updated_at: str
    collaborators: List[str]

class ChatMessage(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: str

class ActivityEvent(BaseModel):
    id: str
    type: str
    user: str
    description: str
    timestamp: str

# Mock Data
mock_collaborators = [
    Collaborator(id='1', name='Alice', status='online', role='owner', last_active='now'),
    Collaborator(id='2', name='Bob', status='busy', role='editor', last_active='2m ago'),
    Collaborator(id='3', name='Carol', status='away', role='viewer', last_active='5m ago'),
]
mock_documents = [
    Document(id='doc1', title='Project Plan', content='Initial project plan...', updated_at='2024-06-01T10:00:00Z', collaborators=['1', '2']),
    Document(id='doc2', title='Meeting Notes', content='Notes from meeting...', updated_at='2024-06-01T11:00:00Z', collaborators=['1', '3']),
]
mock_boards = [
    Board(
        id='board1',
        title='Sprint Board',
        tasks=[
            BoardTask(id='t1', content='Design UI', status='todo', assignees=['1']),
            BoardTask(id='t2', content='Implement API', status='in_progress', assignees=['2']),
            BoardTask(id='t3', content='Write tests', status='done', assignees=['3']),
        ],
        updated_at='2024-06-01T12:00:00Z',
        collaborators=['1', '2', '3']
    )
]
mock_chat = [
    ChatMessage(id='m1', sender='Alice', content='Let’s start the meeting.', timestamp='2024-06-01T10:05:00Z'),
    ChatMessage(id='m2', sender='Bob', content='I’m here!', timestamp='2024-06-01T10:06:00Z'),
]
mock_activity = [
    ActivityEvent(id='a1', type='join', user='Alice', description='joined the session', timestamp='2024-06-01T10:00:00Z'),
    ActivityEvent(id='a2', type='edit', user='Bob', description='edited Project Plan', timestamp='2024-06-01T10:10:00Z'),
]

# Endpoints
@router.get('/collaborators')
def get_collaborators():
    return {'success': True, 'collaborators': [c.dict() for c in mock_collaborators]}

@router.get('/documents')
def get_documents():
    return {'success': True, 'documents': [d.dict() for d in mock_documents]}

@router.get('/boards')
def get_boards():
    return {'success': True, 'boards': [b.dict() for b in mock_boards]}

@router.get('/chat')
def get_chat():
    return {'success': True, 'chat': [m.dict() for m in mock_chat]}

@router.get('/activity')
def get_activity():
    return {'success': True, 'activity': [a.dict() for a in mock_activity]}

# Add/Update endpoints (simulate CRUD)
@router.post('/documents')
def add_document(doc: Document):
    mock_documents.append(doc)
    return {'success': True, 'document': doc.dict()}

@router.put('/documents/{doc_id}')
def update_document(doc_id: str, doc: Document):
    for i, d in enumerate(mock_documents):
        if d.id == doc_id:
            mock_documents[i] = doc
            return {'success': True, 'document': doc.dict()}
    raise HTTPException(status_code=404, detail='Document not found')

@router.post('/boards')
def add_board(board: Board):
    mock_boards.append(board)
    return {'success': True, 'board': board.dict()}

@router.put('/boards/{board_id}')
def update_board(board_id: str, board: Board):
    for i, b in enumerate(mock_boards):
        if b.id == board_id:
            mock_boards[i] = board
            return {'success': True, 'board': board.dict()}
    raise HTTPException(status_code=404, detail='Board not found')

@router.post('/chat')
def add_chat_message(msg: ChatMessage):
    mock_chat.append(msg)
    return {'success': True, 'message': msg.dict()}

@router.post('/activity')
def add_activity(event: ActivityEvent):
    mock_activity.append(event)
    return {'success': True, 'event': event.dict()} 