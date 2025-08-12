from sqlalchemy.orm import Session
from .models import EvolutionLog as EvolutionLogModel
from datetime import datetime
from typing import Dict, Any, List, Optional

class EvolutionLogManager:
    def create_log(self, db: Session, version: str, description: str, changes: dict, status: str = "pending") -> Dict[str, Any]:
        log = EvolutionLogModel(
            version=version,
            description=description,
            changes=changes,
            status=status,
            started_at=datetime.now(),
            completed_at=None
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return {"success": True, "log_id": log.id, "log": self._serialize_log(log)}

    def list_logs(self, db: Session) -> List[Dict[str, Any]]:
        logs = db.query(EvolutionLogModel).order_by(EvolutionLogModel.started_at.desc()).all()
        return [self._serialize_log(l) for l in logs]

    def get_log(self, db: Session, log_id: int) -> Optional[Dict[str, Any]]:
        log = db.query(EvolutionLogModel).filter_by(id=log_id).first()
        return self._serialize_log(log) if log else None

    def update_log_status(self, db: Session, log_id: int, status: str, completed: bool = False) -> Dict[str, Any]:
        log = db.query(EvolutionLogModel).filter_by(id=log_id).first()
        if not log:
            return {"success": False, "message": "Log not found"}
        log.status = status
        if completed:
            log.completed_at = datetime.now()
        db.commit()
        return {"success": True, "log": self._serialize_log(log)}

    def _serialize_log(self, log: EvolutionLogModel) -> Dict[str, Any]:
        return {
            "id": log.id,
            "version": log.version,
            "description": log.description,
            "changes": log.changes,
            "status": log.status,
            "started_at": log.started_at.isoformat() if log.started_at else None,
            "completed_at": log.completed_at.isoformat() if log.completed_at else None
        } 