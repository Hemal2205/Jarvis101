from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from core.db import get_db
from core.evolution_engine import EvolutionEngine
from core.models import EvolutionSuggestion, EvolutionHistory, EvolutionSuggestionCollaboration, SuggestionMessage, AutonomousAgent
from core.notification_manager import NotificationManager
from sqlalchemy import func

evolution_engine = EvolutionEngine()
notification_manager = NotificationManager()
router = APIRouter(prefix="/api/evolution", tags=["evolution"])

@router.post("/analyze")
def analyze(db: Session = Depends(get_db)):
    suggestions = evolution_engine.analyze(db)
    return {"success": True, "suggestions": [s.description for s in suggestions]}

@router.get("/suggestions")
def get_suggestions(db: Session = Depends(get_db)):
    suggestions = db.query(EvolutionSuggestion).all()
    def get_assigned_agent(s):
        if s.assigned_agent_id:
            agent = db.query(AutonomousAgent).filter_by(id=s.assigned_agent_id).first()
            if agent:
                return {
                    "id": agent.id,
                    "name": agent.name,
                    "avatar_url": agent.avatar_url,
                    "role": agent.role
                }
        return None
    return {"suggestions": [
        {
            "id": s.id,
            "agent_id": s.agent_id,
            "type": s.type,
            "description": s.description,
            "status": s.status,
            "created_at": s.created_at,
            "assigned_agent": get_assigned_agent(s)
        } for s in suggestions
    ]}

@router.post("/apply/{suggestion_id}")
def apply_suggestion(suggestion_id: int, db: Session = Depends(get_db)):
    result = evolution_engine.apply_suggestion(db, suggestion_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@router.post("/reject/{suggestion_id}")
def reject_suggestion(suggestion_id: int, db: Session = Depends(get_db)):
    result = evolution_engine.reject_suggestion(db, suggestion_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@router.post("/collaborate/{suggestion_id}")
def collaborate_on_suggestion(
    suggestion_id: int,
    agent_id: int = Body(...),
    action: str = Body(...),
    comment: str = Body(None),
    db: Session = Depends(get_db)
):
    collaboration = evolution_engine.add_collaboration(db, suggestion_id, agent_id, action, comment)
    return {"success": True, "collaboration": {
        "id": collaboration.id,
        "suggestion_id": collaboration.suggestion_id,
        "agent_id": collaboration.agent_id,
        "action": collaboration.action,
        "comment": collaboration.comment,
        "timestamp": collaboration.timestamp
    }}

@router.get("/collaborations/{suggestion_id}")
def get_collaborations(suggestion_id: int, db: Session = Depends(get_db)):
    collaborations = evolution_engine.get_collaborations(db, suggestion_id)
    return {"collaborations": [
        {
            "id": c.id,
            "suggestion_id": c.suggestion_id,
            "agent_id": c.agent_id,
            "action": c.action,
            "comment": c.comment,
            "timestamp": c.timestamp
        } for c in collaborations
    ]}

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    history = evolution_engine.get_history(db)
    return {"history": [
        {"id": h.id, "suggestion_id": h.suggestion_id, "action": h.action, "timestamp": h.timestamp, "details": h.details} for h in history
    ]}

@router.get("/votes/{suggestion_id}")
def get_votes(suggestion_id: int, db: Session = Depends(get_db)):
    return evolution_engine.get_vote_counts(db, suggestion_id)

@router.get("/consensus/{suggestion_id}")
def get_consensus(suggestion_id: int, db: Session = Depends(get_db)):
    return {"consensus": evolution_engine.get_consensus_status(db, suggestion_id)}

@router.post("/message/{suggestion_id}")
def post_message(
    suggestion_id: int,
    agent_id: int = Body(...),
    content: str = Body(...),
    parent_id: int = Body(None),
    db: Session = Depends(get_db)
):
    msg = SuggestionMessage(
        suggestion_id=suggestion_id,
        agent_id=agent_id,
        content=content,
        parent_id=parent_id
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "suggestion_id": msg.suggestion_id,
        "agent_id": msg.agent_id,
        "content": msg.content,
        "parent_id": msg.parent_id,
        "timestamp": msg.timestamp
    }

@router.get("/messages/{suggestion_id}")
def get_messages(suggestion_id: int, db: Session = Depends(get_db)):
    def serialize(msg):
        return {
            "id": msg.id,
            "suggestion_id": msg.suggestion_id,
            "agent_id": msg.agent_id,
            "content": msg.content,
            "parent_id": msg.parent_id,
            "timestamp": msg.timestamp,
            "replies": [serialize(r) for r in msg.replies]
        }
    messages = db.query(SuggestionMessage).filter_by(suggestion_id=suggestion_id, parent_id=None).order_by(SuggestionMessage.timestamp.asc()).all()
    return {"messages": [serialize(m) for m in messages]}

@router.get("/notifications")
def get_notifications(user_id: int = 1, db: Session = Depends(get_db)):
    notifications = notification_manager.list_notifications(db, user_id)
    return {"notifications": notifications}

@router.post("/notifications/read/{notification_id}")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    result = notification_manager.mark_as_read(db, notification_id)
    return result

@router.get("/analytics/collaboration")
def analytics_collaboration(db: Session = Depends(get_db)):
    # Collaborations per agent
    agent_stats = db.query(EvolutionSuggestionCollaboration.agent_id, func.count()).group_by(EvolutionSuggestionCollaboration.agent_id).all()
    # Collaborations per suggestion
    suggestion_stats = db.query(EvolutionSuggestionCollaboration.suggestion_id, func.count()).group_by(EvolutionSuggestionCollaboration.suggestion_id).all()
    return {
        "per_agent": [{"agent_id": a, "count": c} for a, c in agent_stats],
        "per_suggestion": [{"suggestion_id": s, "count": c} for s, c in suggestion_stats]
    }

@router.get("/analytics/suggestion_outcomes")
def analytics_suggestion_outcomes(db: Session = Depends(get_db)):
    # Applied vs. rejected over time
    applied = db.query(func.date(EvolutionHistory.timestamp), func.count()).filter(EvolutionHistory.action == 'applied').group_by(func.date(EvolutionHistory.timestamp)).all()
    rejected = db.query(func.date(EvolutionHistory.timestamp), func.count()).filter(EvolutionHistory.action == 'rejected').group_by(func.date(EvolutionHistory.timestamp)).all()
    return {
        "applied": [{"date": d, "count": c} for d, c in applied],
        "rejected": [{"date": d, "count": c} for d, c in rejected]
    }

@router.get("/analytics/consensus")
def analytics_consensus(db: Session = Depends(get_db)):
    # Consensus status counts
    from core.evolution_engine import EvolutionEngine
    engine = EvolutionEngine()
    suggestions = db.query(EvolutionSuggestion).all()
    consensus_counts = {"positive": 0, "negative": 0, "none": 0}
    for s in suggestions:
        status = engine.get_consensus_status(db, s.id)
        consensus_counts[status] += 1
    return consensus_counts

@router.get("/analytics/agent_activity")
def analytics_agent_activity(db: Session = Depends(get_db)):
    # Messages per agent
    from core.models import SuggestionMessage
    msg_stats = db.query(SuggestionMessage.agent_id, func.count()).group_by(SuggestionMessage.agent_id).all()
    # Votes per agent
    vote_stats = db.query(EvolutionSuggestionCollaboration.agent_id, func.count()).filter(EvolutionSuggestionCollaboration.action.in_(['upvote', 'downvote'])).group_by(EvolutionSuggestionCollaboration.agent_id).all()
    # Assignments per agent
    assign_stats = db.query(EvolutionSuggestion.assigned_agent_id, func.count()).group_by(EvolutionSuggestion.assigned_agent_id).all()
    return {
        "messages": [{"agent_id": a, "count": c} for a, c in msg_stats],
        "votes": [{"agent_id": a, "count": c} for a, c in vote_stats],
        "assignments": [{"agent_id": a, "count": c} for a, c in assign_stats]
    } 