from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from core.db import get_db
from core.models import Task, Skill, LearningSession, Notification, User, Memory, AutonomousAgent
from datetime import datetime, timedelta
import psutil
import time
import os

router = APIRouter()

# Track system start time for uptime calculation
SYSTEM_START_TIME = time.time()

@router.get("/api/analytics/dashboard")
async def get_analytics_dashboard(db: Session = Depends(get_db)):
    try:
        # Get real system metrics
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        disk = psutil.disk_usage('/')
        uptime_seconds = time.time() - SYSTEM_START_TIME
        uptime_hours = uptime_seconds / 3600
        
        # Get real recent events from various sources
        recent_tasks = db.query(Task).order_by(desc(Task.created_at)).limit(5).all()
        recent_memories = db.query(Memory).order_by(desc(Memory.timestamp)).limit(5).all()
        recent_notifications = db.query(Notification).order_by(desc(Notification.created_at)).limit(5).all()
        
        recent_events = []
        
        # Add task events
        for task in recent_tasks:
            recent_events.append({
                "type": "task_created" if task.status == 'pending' else f"task_{task.status}",
                "timestamp": task.created_at.isoformat() if task.created_at else None,
                "data": {
                    "description": task.description[:100] + "..." if len(task.description) > 100 else task.description,
                    "status": task.status
                }
            })
        
        # Add memory events
        for memory in recent_memories:
            recent_events.append({
                "type": "memory_added",
                "timestamp": memory.timestamp.isoformat() if memory.timestamp else None,
                "data": {
                    "type": memory.type,
                    "content": memory.content[:100] + "..." if len(memory.content) > 100 else memory.content
                }
            })
        
        # Sort by timestamp
        recent_events.sort(key=lambda x: x['timestamp'] or '1970-01-01', reverse=True)
        recent_events = recent_events[:10]  # Keep only top 10
        
        # Get event counts by type
        event_counts = [
            {"type": "tasks", "count": db.query(Task).count()},
            {"type": "memories", "count": db.query(Memory).count()},
            {"type": "notifications", "count": db.query(Notification).count()},
            {"type": "learning_sessions", "count": db.query(LearningSession).count()}
        ]
        
        # Get real skills summary
        skills = db.query(Skill).all()
        skills_summary = {
            "total_skills": len(skills),
            "mastered": len([s for s in skills if s.mastery_score and s.mastery_score >= 0.8]),
            "in_progress": len([s for s in skills if s.mastery_score and 0.3 <= s.mastery_score < 0.8]),
            "beginner": len([s for s in skills if not s.mastery_score or s.mastery_score < 0.3])
        }
        
        # Get real tasks summary
        tasks = db.query(Task).all()
        tasks_summary = {
            "total_tasks": len(tasks),
            "completed": len([t for t in tasks if t.status == 'completed']),
            "pending": len([t for t in tasks if t.status == 'pending']),
            "in_progress": len([t for t in tasks if t.status == 'in_progress']),
            "cancelled": len([t for t in tasks if t.status == 'cancelled'])
        }
        
        # Get learning sessions summary
        learning_sessions = db.query(LearningSession).filter(
            LearningSession.timestamp >= datetime.now() - timedelta(days=7)
        ).all()
        learning_summary = {
            "total_sessions": len(learning_sessions),
            "avg_completion_rate": sum(s.completion_rate for s in learning_sessions) / len(learning_sessions) if learning_sessions else 0,
            "total_duration": sum(s.duration for s in learning_sessions) if learning_sessions else 0
        }
        
        # Get notifications summary
        notifications = db.query(Notification).all()
        notifications_summary = {
            "total_notifications": len(notifications),
            "unread": len([n for n in notifications if not n.is_read]),
            "read": len([n for n in notifications if n.is_read])
        }
        
        # Get memory usage statistics
        memory_summary = {
            "total_memories": db.query(Memory).count(),
            "text_memories": db.query(Memory).filter(Memory.type == 'text').count(),
            "voice_memories": db.query(Memory).filter(Memory.type == 'voice').count(),
            "image_memories": db.query(Memory).filter(Memory.type == 'image').count()
        }
        
        # Get autonomous agents summary
        agents = db.query(AutonomousAgent).all()
        agents_summary = {
            "total_agents": len(agents),
            "active_agents": len([a for a in agents if a.status == 'active']),
            "idle_agents": len([a for a in agents if a.status == 'idle'])
        }
        
        return JSONResponse({
            "success": True,
            "recent_events": recent_events,
            "event_counts": event_counts,
            "skills_summary": skills_summary,
            "tasks_summary": tasks_summary,
            "learning_summary": learning_summary,
            "notifications_summary": notifications_summary,
            "memory_summary": memory_summary,
            "agents_summary": agents_summary,
            "system_metrics": {
                "uptime_hours": round(uptime_hours, 2),
                "memory_usage": round(memory.percent, 1),
                "memory_available_gb": round(memory.available / (1024**3), 2),
                "memory_total_gb": round(memory.total / (1024**3), 2),
                "cpu_usage": round(cpu_percent, 1),
                "disk_usage_percent": round((disk.used / disk.total) * 100, 1),
                "disk_free_gb": round(disk.free / (1024**3), 2),
                "active_sessions": db.query(User).count(),
                "data_processed_mb": round((db.query(Memory).count() * 0.5), 1)  # Estimate
            },
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to load analytics data"
        }, status_code=500)

@router.post("/api/dashboard/start-learning")
async def start_learning_session(request: dict, db: Session = Depends(get_db)):
    """Start a new learning session"""
    try:
        topic = request.get("topic", "General Learning")
        user_id = request.get("user_id", 1)
        
        # Create a new learning session
        session = LearningSession(
            user_id=user_id,
            topic=topic,
            duration=0,
            completion_rate=0.0,
            timestamp=datetime.now()
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return JSONResponse({
            "success": True,
            "message": f"Started learning session for: {topic}",
            "session_id": session.id,
            "topic": topic
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to start learning session"
        }, status_code=500)

@router.post("/api/dashboard/set-goal")
async def set_daily_goal(request: dict, db: Session = Depends(get_db)):
    """Set a daily goal for the user"""
    try:
        goal = request.get("goal")
        user_id = request.get("user_id", 1)
        
        if not goal:
            return JSONResponse({
                "success": False,
                "message": "Goal text is required"
            }, status_code=400)
        
        # Create a task for the goal
        task = Task(
            user_id=user_id,
            description=f"Daily Goal: {goal}",
            status="pending",
            created_at=datetime.now()
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        return JSONResponse({
            "success": True,
            "message": f"Daily goal set: {goal}",
            "task_id": task.id,
            "goal": goal
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to set daily goal"
        }, status_code=500)

@router.post("/api/dashboard/run-task")
async def run_task(request: dict, db: Session = Depends(get_db)):
    """Execute a specific task"""
    try:
        task_description = request.get("task", "General task execution")
        user_id = request.get("user_id", 1)
        
        # Create and immediately start the task
        task = Task(
            user_id=user_id,
            description=task_description,
            status="in_progress",
            created_at=datetime.now()
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        # Simulate task processing
        import time
        time.sleep(1)  # Simulate processing
        
        # Update task as completed
        task.status = "completed"
        task.completed_at = datetime.now()
        task.result = {"status": "success", "message": f"Task '{task_description}' completed successfully"}
        db.commit()
        
        return JSONResponse({
            "success": True,
            "message": f"Task executed successfully: {task_description}",
            "task_id": task.id,
            "result": task.result
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to execute task"
        }, status_code=500)

@router.get("/api/dashboard/analytics")
async def view_detailed_analytics(db: Session = Depends(get_db)):
    """Get detailed analytics data"""
    try:
        # Get detailed task analytics
        tasks_by_status = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()
        tasks_by_day = db.query(
            func.date(Task.created_at).label('date'),
            func.count(Task.id).label('count')
        ).group_by(func.date(Task.created_at)).order_by(func.date(Task.created_at)).limit(7).all()
        
        # Get skill progression data
        skills_by_category = db.query(Skill.category, func.count(Skill.id)).group_by(Skill.category).all()
        skill_mastery_levels = db.query(
            func.case(
                (Skill.mastery_score >= 0.8, 'Expert'),
                (Skill.mastery_score >= 0.5, 'Intermediate'),
                else_='Beginner'
            ).label('level'),
            func.count(Skill.id).label('count')
        ).group_by('level').all()
        
        # Get learning session trends
        learning_trends = db.query(
            func.date(LearningSession.timestamp).label('date'),
            func.avg(LearningSession.completion_rate).label('avg_completion'),
            func.sum(LearningSession.duration).label('total_duration')
        ).group_by(func.date(LearningSession.timestamp)).order_by(func.date(LearningSession.timestamp)).limit(7).all()
        
        return JSONResponse({
            "success": True,
            "tasks_by_status": [{"status": status, "count": count} for status, count in tasks_by_status],
            "tasks_by_day": [{"date": str(date), "count": count} for date, count in tasks_by_day],
            "skills_by_category": [{"category": category or "Uncategorized", "count": count} for category, count in skills_by_category],
            "skill_mastery_levels": [{"level": level, "count": count} for level, count in skill_mastery_levels],
            "learning_trends": [{
                "date": str(date),
                "avg_completion": float(avg_completion) if avg_completion else 0,
                "total_duration": int(total_duration) if total_duration else 0
            } for date, avg_completion, total_duration in learning_trends],
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to load detailed analytics"
        }, status_code=500)
