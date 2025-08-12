from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from core.db import get_db
from core.models import AutonomousAgent, AutonomousAgentTask
from datetime import datetime
import threading
import time

router = APIRouter(prefix="/api/agents", tags=["autonomous_agents"])

try:
    from core.system_automation import system_automation
except ImportError:
    system_automation = None

# --- Real Multi-Task Agent Logic ---
class AgentRunner:
    def __init__(self, agent_id, db: Session):
        self.agent_id = agent_id
        self.db = db
        self.thread = threading.Thread(target=self.run, daemon=True)
        self.running = False

    def start(self):
        if not self.running:
            self.running = True
            if not self.thread.is_alive():
                self.thread = threading.Thread(target=self.run, daemon=True)
                self.thread.start()

    def stop(self):
        self.running = False

    def run(self):
        while self.running:
            agent = self.db.query(AutonomousAgent).filter_by(id=self.agent_id).first()
            if agent and agent.status == 'running':
                # Fetch the next in-progress or pending task
                task = (
                    self.db.query(AutonomousAgentTask)
                    .filter_by(agent_id=self.agent_id)
                    .filter(AutonomousAgentTask.status.in_(['pending', 'in_progress']))
                    .order_by(AutonomousAgentTask.assigned_at.asc())
                    .first()
                )
                if task:
                    if task.status == 'pending':
                        task.status = 'in_progress'
                        agent.current_task = task.description
                        agent.last_active = datetime.utcnow()
                        self.db.commit()
                    # --- Real execution logic ---
                    try:
                        if system_automation and hasattr(system_automation, 'execute_complex_task'):
                            import asyncio
                            result = asyncio.run(system_automation.execute_complex_task(task.description))
                            task.result = str(result)
                        else:
                            task.result = f"Executed: {task.description} (mock)"
                        task.status = 'completed'
                    except Exception as e:
                        task.result = f"Error: {str(e)}"
                        task.status = 'failed'
                    task.completed_at = datetime.utcnow()
                    agent.current_task = None
                    agent.last_active = datetime.utcnow()
                    self.db.commit()
                else:
                    # No tasks to process
                    agent.current_task = None
                    self.db.commit()
            time.sleep(1)

# In-memory runner registry
agent_runners = {}

def get_agent_runner(agent_id, db):
    if agent_id not in agent_runners:
        agent_runners[agent_id] = AgentRunner(agent_id, db)
    return agent_runners[agent_id]

# --- Endpoints ---
@router.get("/")
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(AutonomousAgent).all()
    return [
        {
            "id": a.id,
            "name": a.name,
            "status": a.status,
            "created_at": a.created_at,
            "last_active": a.last_active,
            "current_task": a.current_task,
            "avatar_url": a.avatar_url,
            "role": a.role,
            "task_history": [t.description for t in a.tasks]
        } for a in agents
    ]

@router.post("/")
def create_agent(
    name: str = Body(...),
    avatar_url: str = Body(None),
    role: str = Body(None),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    agent = AutonomousAgent(name=name, status="idle", created_at=now, last_active=now, avatar_url=avatar_url, role=role)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {
        "id": agent.id,
        "name": agent.name,
        "status": agent.status,
        "created_at": agent.created_at,
        "last_active": agent.last_active,
        "current_task": agent.current_task,
        "avatar_url": agent.avatar_url,
        "role": agent.role,
        "task_history": []
    }

@router.post("/{agent_id}/start")
def start_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AutonomousAgent).filter_by(id=agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.status = "running"
    agent.last_active = datetime.utcnow()
    db.commit()
    runner = get_agent_runner(agent_id, db)
    runner.start()
    return {
        "id": agent.id,
        "name": agent.name,
        "status": agent.status,
        "created_at": agent.created_at,
        "last_active": agent.last_active,
        "current_task": agent.current_task,
        "task_history": [t.description for t in agent.tasks]
    }

@router.post("/{agent_id}/stop")
def stop_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AutonomousAgent).filter_by(id=agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.status = "stopped"
    agent.last_active = datetime.utcnow()
    db.commit()
    runner = get_agent_runner(agent_id, db)
    runner.stop()
    return {
        "id": agent.id,
        "name": agent.name,
        "status": agent.status,
        "created_at": agent.created_at,
        "last_active": agent.last_active,
        "current_task": agent.current_task,
        "task_history": [t.description for t in agent.tasks]
    }

@router.delete("/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AutonomousAgent).filter_by(id=agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db.delete(agent)
    db.commit()
    if agent_id in agent_runners:
        agent_runners[agent_id].stop()
        del agent_runners[agent_id]
    return {"success": True}

@router.post("/{agent_id}/assign-task")
def assign_task(agent_id: int, description: str, db: Session = Depends(get_db)):
    agent = db.query(AutonomousAgent).filter_by(id=agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.status != "running":
        raise HTTPException(status_code=400, detail="Agent must be running to assign a task")
    now = datetime.utcnow()
    task = AutonomousAgentTask(agent_id=agent_id, description=description, status="pending", assigned_at=now)
    db.add(task)
    agent.last_active = now
    db.commit()
    return {
        "id": task.id,
        "agent_id": task.agent_id,
        "description": task.description,
        "status": task.status,
        "assigned_at": task.assigned_at,
        "completed_at": task.completed_at,
        "result": task.result
    }

@router.post("/{agent_id}/assign-tasks")
def assign_tasks(agent_id: int, descriptions: list, db: Session = Depends(get_db)):
    agent = db.query(AutonomousAgent).filter_by(id=agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.status != "running":
        raise HTTPException(status_code=400, detail="Agent must be running to assign tasks")
    now = datetime.utcnow()
    created_tasks = []
    for desc in descriptions:
        task = AutonomousAgentTask(agent_id=agent_id, description=desc, status="pending", assigned_at=now)
        db.add(task)
        created_tasks.append({
            "id": task.id,
            "agent_id": task.agent_id,
            "description": task.description,
            "status": task.status,
            "assigned_at": task.assigned_at,
            "completed_at": task.completed_at,
            "result": task.result
        })
    agent.last_active = now
    db.commit()
    return {"tasks": created_tasks}

@router.get("/{agent_id}/status")
def get_agent_status(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AutonomousAgent).filter_by(id=agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    tasks = db.query(AutonomousAgentTask).filter_by(agent_id=agent_id).all()
    return {
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "status": agent.status,
            "created_at": agent.created_at,
            "last_active": agent.last_active,
            "current_task": agent.current_task,
            "task_history": [t.description for t in agent.tasks]
        },
        "tasks": [
            {
                "id": t.id,
                "agent_id": t.agent_id,
                "description": t.description,
                "status": t.status,
                "assigned_at": t.assigned_at,
                "completed_at": t.completed_at,
                "result": t.result
            } for t in tasks
        ]
    }

@router.post("/broadcast-task")
def broadcast_task(description: str, db: Session = Depends(get_db)):
    agents = db.query(AutonomousAgent).filter_by(status="running").all()
    now = datetime.utcnow()
    created_tasks = []
    for agent in agents:
        task = AutonomousAgentTask(agent_id=agent.id, description=description, status="pending", assigned_at=now)
        db.add(task)
        agent.last_active = now
        created_tasks.append({
            "agent_id": agent.id,
            "task_id": task.id,
            "description": description
        })
    db.commit()
    return {"tasks": created_tasks}

@router.patch("/{agent_id}/profile")
def update_agent_profile(
    agent_id: int,
    avatar_url: str = Body(None),
    role: str = Body(None),
    db: Session = Depends(get_db)
):
    agent = db.query(AutonomousAgent).filter_by(id=agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if avatar_url is not None:
        agent.avatar_url = avatar_url
    if role is not None:
        agent.role = role
    db.commit()
    return {
        "id": agent.id,
        "name": agent.name,
        "status": agent.status,
        "created_at": agent.created_at,
        "last_active": agent.last_active,
        "current_task": agent.current_task,
        "avatar_url": agent.avatar_url,
        "role": agent.role,
        "task_history": [t.description for t in agent.tasks]
    } 