from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

router = APIRouter(prefix="/api/vr", tags=["vr_workspace"])

class VRWorkspaceState(BaseModel):
    user_id: str
    last_active: str
    current_panel: str
    camera_position: List[float]

class VRMemory(BaseModel):
    id: str
    title: str
    timestamp: str
    summary: str

class VRTask(BaseModel):
    id: str
    content: str
    status: str
    due: Optional[str]

class VRTaskBoard(BaseModel):
    id: str
    title: str
    tasks: List[VRTask]

class VRLearningProgress(BaseModel):
    id: str
    topic: str
    progress: int

# Mock data
mock_workspace_state = VRWorkspaceState(
    user_id="user1",
    last_active=datetime.now().isoformat(),
    current_panel="memory_vault",
    camera_position=[0, 2, 8]
)
mock_memories = [
    VRMemory(id="m1", title="Meeting with Alice", timestamp="2024-06-01T10:00:00Z", summary="Discussed project goals."),
    VRMemory(id="m2", title="Project Plan Updated", timestamp="2024-06-01T11:00:00Z", summary="Added new milestones."),
    VRMemory(id="m3", title="Learned: React Three Fiber", timestamp="2024-06-01T12:00:00Z", summary="Explored 3D UI in React.")
]
mock_task_board = VRTaskBoard(
    id="tb1",
    title="Today’s Tasks",
    tasks=[
        VRTask(id="t1", content="Finish VR Workspace UI", status="in_progress", due="2024-06-01"),
        VRTask(id="t2", content="Review PR #42", status="todo", due="2024-06-01"),
        VRTask(id="t3", content="Team Standup 3pm", status="todo", due="2024-06-01")
    ]
)
mock_learning_progress = [
    VRLearningProgress(id="lp1", topic="Python", progress=85),
    VRLearningProgress(id="lp2", topic="AI Ethics", progress=60),
    VRLearningProgress(id="lp3", topic="3D UI", progress=40)
]

@router.get('/workspace')
def get_workspace_state():
    return {"success": True, "state": mock_workspace_state.dict()}

@router.get('/memories')
def get_memories():
    return {"success": True, "memories": [m.dict() for m in mock_memories]}

@router.get('/taskboard')
def get_task_board():
    return {"success": True, "task_board": mock_task_board.dict()}

@router.get('/learning')
def get_learning_progress():
    return {"success": True, "progress": [p.dict() for p in mock_learning_progress]} 