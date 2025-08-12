from sqlalchemy.orm import Session
from core.models import EvolutionSuggestion, EvolutionHistory, AutonomousAgent, AutonomousAgentTask, EvolutionSuggestionCollaboration
from datetime import datetime, timedelta
import logging

try:
    from core.ai_engine import ai_engine
except ImportError:
    ai_engine = None
try:
    from core.notification_manager import NotificationManager
    notification_manager = NotificationManager()
except ImportError:
    notification_manager = None

logger = logging.getLogger(__name__)

class EvolutionEngine:
    def __init__(self):
        pass

    def analyze(self, db: Session):
        """Analyze agent/task logs and generate advanced improvement suggestions."""
        suggestions = []
        now = datetime.utcnow()
        one_day_ago = now - timedelta(days=1)
        agents = db.query(AutonomousAgent).all()
        for agent in agents:
            tasks = db.query(AutonomousAgentTask).filter_by(agent_id=agent.id).all()
            if not tasks:
                continue
            completed = [t for t in tasks if t.status == 'completed']
            failed = [t for t in tasks if t.status == 'failed']
            recent = [t for t in tasks if t.assigned_at > one_day_ago]
            success_rate = len(completed) / max(1, len(completed) + len(failed))
            avg_duration = None
            if completed:
                avg_duration = sum([(t.completed_at - t.assigned_at).total_seconds() for t in completed if t.completed_at]) / len(completed)
            # Suggest retry logic for agents with >2 failures in last day
            if len([t for t in recent if t.status == 'failed']) > 2:
                desc = f"Agent {agent.name} failed more than 2 tasks in the last 24h. Suggest adding retry logic."
                suggestion = EvolutionSuggestion(
                    agent_id=agent.id,
                    type='retry_logic',
                    description=desc,
                    status='pending',
                    created_at=now
                )
                db.add(suggestion)
                suggestions.append(suggestion)
                self.assign_suggestion_to_agent(db, suggestion)
                if notification_manager:
                    notification_manager.create_notification(db, user_id=1, message=desc)
            # Suggest optimization for slow agents
            if avg_duration and avg_duration > 30:
                desc = f"Agent {agent.name} has high average task duration ({int(avg_duration)}s). Suggest optimizing workflow."
                suggestion = EvolutionSuggestion(
                    agent_id=agent.id,
                    type='optimize_workflow',
                    description=desc,
                    status='pending',
                    created_at=now
                )
                db.add(suggestion)
                suggestions.append(suggestion)
                self.assign_suggestion_to_agent(db, suggestion)
                if notification_manager:
                    notification_manager.create_notification(db, user_id=1, message=desc)
            # Use AI engine for code or skill suggestions
            if ai_engine:
                try:
                    prompt = f"Agent {agent.name} has completed {len(completed)} tasks, failed {len(failed)}. Suggest a code or skill improvement."
                    ai_result = ai_engine.process_command(prompt)
                    if hasattr(ai_result, '__await__'):
                        import asyncio
                        ai_result = asyncio.run(ai_result)
                    if ai_result and ai_result.get('success'):
                        desc = f"AI Suggestion for {agent.name}: {ai_result.get('response', ai_result.get('code', ''))}"
                        suggestion = EvolutionSuggestion(
                            agent_id=agent.id,
                            type='ai_suggestion',
                            description=desc,
                            status='pending',
                            created_at=now
                        )
                        db.add(suggestion)
                        suggestions.append(suggestion)
                        self.assign_suggestion_to_agent(db, suggestion)
                        if notification_manager:
                            notification_manager.create_notification(db, user_id=1, message=desc)
                except Exception as e:
                    logger.warning(f"AI suggestion failed: {e}")
        db.commit()
        return suggestions

    def get_suggestions(self, db: Session):
        return db.query(EvolutionSuggestion).order_by(EvolutionSuggestion.created_at.desc()).all()

    def apply_suggestion(self, db: Session, suggestion_id: int):
        suggestion = db.query(EvolutionSuggestion).filter_by(id=suggestion_id).first()
        if not suggestion:
            return {"success": False, "message": "Suggestion not found"}
        suggestion.status = 'applied'
        history = EvolutionHistory(
            suggestion_id=suggestion.id,
            action='applied',
            timestamp=datetime.utcnow(),
            details=suggestion.description
        )
        db.add(history)
        if notification_manager:
            notification_manager.create_notification(db, user_id=1, message=f"Suggestion '{suggestion.description}' was applied.")
        db.commit()
        return {"success": True, "suggestion": suggestion}

    def reject_suggestion(self, db: Session, suggestion_id: int):
        suggestion = db.query(EvolutionSuggestion).filter_by(id=suggestion_id).first()
        if not suggestion:
            return {"success": False, "message": "Suggestion not found"}
        suggestion.status = 'rejected'
        history = EvolutionHistory(
            suggestion_id=suggestion.id,
            action='rejected',
            timestamp=datetime.utcnow(),
            details=suggestion.description
        )
        db.add(history)
        if notification_manager:
            notification_manager.create_notification(db, user_id=1, message=f"Suggestion '{suggestion.description}' was rejected.")
        db.commit()
        return {"success": True, "suggestion": suggestion}

    def get_history(self, db: Session):
        return db.query(EvolutionHistory).order_by(EvolutionHistory.timestamp.desc()).all()

    def add_collaboration(self, db: Session, suggestion_id: int, agent_id: int, action: str, comment: str = None):
        collaboration = EvolutionSuggestionCollaboration(
            suggestion_id=suggestion_id,
            agent_id=agent_id,
            action=action,
            comment=comment,
            timestamp=datetime.utcnow()
        )
        db.add(collaboration)
        db.commit()
        # Notify assigned agent and all collaborators
        suggestion = db.query(EvolutionSuggestion).filter_by(id=suggestion_id).first()
        if notification_manager and suggestion and suggestion.assigned_agent_id:
            notification_manager.create_notification(db, user_id=1, message=f"Agent {agent_id} performed '{action}' on suggestion '{suggestion.description}'")
        return collaboration

    def get_collaborations(self, db: Session, suggestion_id: int):
        return db.query(EvolutionSuggestionCollaboration).filter_by(suggestion_id=suggestion_id).order_by(EvolutionSuggestionCollaboration.timestamp.asc()).all()

    def get_vote_counts(self, db: Session, suggestion_id: int):
        upvotes = db.query(EvolutionSuggestionCollaboration).filter_by(suggestion_id=suggestion_id, action='upvote').count()
        downvotes = db.query(EvolutionSuggestionCollaboration).filter_by(suggestion_id=suggestion_id, action='downvote').count()
        return {"upvotes": upvotes, "downvotes": downvotes}

    def get_consensus_status(self, db: Session, suggestion_id: int):
        votes = self.get_vote_counts(db, suggestion_id)
        if votes["upvotes"] >= 3 and votes["upvotes"] > votes["downvotes"]:
            return "positive"
        elif votes["downvotes"] >= 3 and votes["downvotes"] > votes["upvotes"]:
            return "negative"
        else:
            return "none"

    def assign_suggestion_to_agent(self, db: Session, suggestion):
        agents = db.query(AutonomousAgent).all()
        if not agents:
            return None
        agent_load = {a.id: db.query(EvolutionSuggestion).filter_by(assigned_agent_id=a.id).count() for a in agents}
        best_agent_id = min(agent_load, key=agent_load.get)
        suggestion.assigned_agent_id = best_agent_id
        db.commit()
        if notification_manager:
            notification_manager.create_notification(db, user_id=1, message=f"Suggestion '{suggestion.description}' assigned to agent {best_agent_id}")
        return best_agent_id

    def auto_assign_all_suggestions(self, db: Session):
        suggestions = db.query(EvolutionSuggestion).filter_by(assigned_agent_id=None).all()
        for s in suggestions:
            self.assign_suggestion_to_agent(db, s) 