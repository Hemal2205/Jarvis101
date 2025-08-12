from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/automation", tags=["automation"])

# Models
class AutomationStep(BaseModel):
    id: str
    type: str
    params: Dict[str, any]

class AutomationLog(BaseModel):
    id: str
    automation_id: str
    status: str
    started_at: str
    finished_at: Optional[str]
    message: str

class Automation(BaseModel):
    id: str
    name: str
    description: str
    trigger: Dict[str, any]
    steps: List[AutomationStep]
    enabled: bool
    last_run: Optional[str]
    logs: List[AutomationLog]

# Mock Data
mock_automations: List[Automation] = [
    Automation(
        id="auto1",
        name="Morning Summary",
        description="Send a summary at 9am",
        trigger={"type": "time", "config": {"time": "09:00"}},
        steps=[
            AutomationStep(id="s1", type="notify", params={"message": "Good morning! Here is your summary."}),
            AutomationStep(id="s2", type="create_task", params={"title": "Review summary", "due": "today"})
        ],
        enabled=True,
        last_run="2024-06-01T09:00:00Z",
        logs=[
            AutomationLog(id="l1", automation_id="auto1", status="success", started_at="2024-06-01T09:00:00Z", finished_at="2024-06-01T09:00:01Z", message="Summary sent.")
        ]
    ),
    Automation(
        id="auto2",
        name="End of Day Recap",
        description="Send recap at 5pm",
        trigger={"type": "time", "config": {"time": "17:00"}},
        steps=[
            AutomationStep(id="s1", type="notify", params={"message": "Here is your end of day recap."})
        ],
        enabled=False,
        last_run="2024-05-31T17:00:00Z",
        logs=[
            AutomationLog(id="l2", automation_id="auto2", status="error", started_at="2024-05-31T17:00:00Z", finished_at="2024-05-31T17:00:01Z", message="Failed to send recap.")
        ]
    )
]

# Endpoints
@router.get('/')
def get_automations():
    return {'success': True, 'automations': [a.dict() for a in mock_automations]}

@router.get('/{automation_id}')
def get_automation(automation_id: str):
    for a in mock_automations:
        if a.id == automation_id:
            return {'success': True, 'automation': a.dict()}
    raise HTTPException(status_code=404, detail='Automation not found')

@router.post('/')
def create_automation(auto: Automation):
    mock_automations.append(auto)
    return {'success': True, 'automation': auto.dict()}

@router.put('/{automation_id}')
def update_automation(automation_id: str, auto: Automation):
    for i, a in enumerate(mock_automations):
        if a.id == automation_id:
            mock_automations[i] = auto
            return {'success': True, 'automation': auto.dict()}
    raise HTTPException(status_code=404, detail='Automation not found')

@router.delete('/{automation_id}')
def delete_automation(automation_id: str):
    global mock_automations
    mock_automations = [a for a in mock_automations if a.id != automation_id]
    return {'success': True}

@router.post('/{automation_id}/run')
def run_automation(automation_id: str):
    for a in mock_automations:
        if a.id == automation_id:
            log = AutomationLog(
                id=str(uuid.uuid4()),
                automation_id=a.id,
                status="success",
                started_at=datetime.now().isoformat(),
                finished_at=datetime.now().isoformat(),
                message="Automation executed."
            )
            a.logs.append(log)
            a.last_run = log.started_at
            return {'success': True, 'log': log.dict()}
    raise HTTPException(status_code=404, detail='Automation not found')

@router.get('/{automation_id}/logs')
def get_automation_logs(automation_id: str):
    for a in mock_automations:
        if a.id == automation_id:
            return {'success': True, 'logs': [l.dict() for l in a.logs]}
    raise HTTPException(status_code=404, detail='Automation not found') 