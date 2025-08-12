from sqlalchemy.orm import Session
from .models import Task as TaskModel, User as UserModel
from .notification_manager import NotificationManager
from datetime import datetime
from typing import Dict, Any, List, Optional

notification_manager = NotificationManager()

class TaskManager:
    def create_task(self, db: Session, user_id: int, description: str) -> Dict[str, Any]:
        task = TaskModel(
            user_id=user_id,
            description=description,
            status="pending",
            created_at=datetime.now(),
            completed_at=None,
            result=None
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return {"success": True, "task_id": task.id, "task": self._serialize_task(task)}

    def list_tasks(self, db: Session, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = db.query(TaskModel)
        if user_id:
            query = query.filter_by(user_id=user_id)
        tasks = query.order_by(TaskModel.created_at.desc()).all()
        return [self._serialize_task(task) for task in tasks]

    def get_task(self, db: Session, task_id: int) -> Optional[Dict[str, Any]]:
        task = db.query(TaskModel).filter_by(id=task_id).first()
        return self._serialize_task(task) if task else None

    def complete_task(self, db: Session, task_id: int, result: Any = None) -> Dict[str, Any]:
        task = db.query(TaskModel).filter_by(id=task_id).first()
        if not task:
            return {"success": False, "message": "Task not found"}
        task.status = "completed"
        task.completed_at = datetime.now()
        task.result = result
        db.commit()
        # Create notification for task completion
        notification_manager.create_notification(
            db,
            user_id=task.user_id,
            message=f'Task "{task.description}" completed.',
            type="task",
            data={"task_id": task.id, "status": "completed"}
        )
        return {"success": True, "task": self._serialize_task(task)}

    def cancel_task(self, db: Session, task_id: int) -> Dict[str, Any]:
        task = db.query(TaskModel).filter_by(id=task_id).first()
        if not task:
            return {"success": False, "message": "Task not found"}
        task.status = "cancelled"
        db.commit()
        # Create notification for task cancellation
        notification_manager.create_notification(
            db,
            user_id=task.user_id,
            message=f'Task "{task.description}" was cancelled.',
            type="task",
            data={"task_id": task.id, "status": "cancelled"}
        )
        return {"success": True, "task": self._serialize_task(task)}

    def _serialize_task(self, task: TaskModel) -> Dict[str, Any]:
        return {
            "id": task.id,
            "user_id": task.user_id,
            "description": task.description,
            "status": task.status,
            "result": task.result,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        } 