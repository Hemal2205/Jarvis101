from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from core.db import get_db
from core.models import Skill, LearningSession, User
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.get("/api/skills")
async def get_skills(user_id: int = 1, db: Session = Depends(get_db)):
    """Get all skills for a user"""
    try:
        skills = db.query(Skill).filter(
            Skill.user_id == user_id
        ).order_by(desc(Skill.last_updated)).all()
        
        return JSONResponse({
            "success": True,
            "skills": [
                {
                    "id": s.id,
                    "name": s.name,
                    "description": s.description,
                    "category": s.category,
                    "level": s.level,
                    "mastery_score": s.mastery_score or 0.0,
                    "resources": s.resources or [],
                    "last_updated": s.last_updated.isoformat() if s.last_updated else None,
                    "learned_at": s.learned_at.isoformat() if s.learned_at else None
                } for s in skills
            ],
            "total_count": len(skills)
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to retrieve skills"
        }, status_code=500)

@router.post("/api/skills/start-learning")
async def start_learning(request: dict, db: Session = Depends(get_db)):
    """Start learning a new skill"""
    try:
        user_id = request.get("user_id", 1)
        skill_name = request.get("skill_name")
        category = request.get("category", "General")
        description = request.get("description", "")
        
        if not skill_name:
            return JSONResponse({
                "success": False,
                "message": "Skill name is required"
            }, status_code=400)
        
        # Check if skill already exists
        existing_skill = db.query(Skill).filter(
            Skill.user_id == user_id,
            Skill.name == skill_name
        ).first()
        
        if existing_skill:
            # Update existing skill
            existing_skill.last_updated = datetime.now()
            existing_skill.description = description or existing_skill.description
            db.commit()
            skill = existing_skill
        else:
            # Create new skill
            skill = Skill(
                user_id=user_id,
                name=skill_name,
                description=description,
                category=category,
                level="beginner",
                mastery_score=0.1,
                resources=[],
                last_updated=datetime.now(),
                learned_at=datetime.now()
            )
            db.add(skill)
            db.commit()
            db.refresh(skill)
        
        # Create learning session
        session = LearningSession(
            user_id=user_id,
            skill_id=skill.id,
            topic=skill_name,
            duration=0,
            completion_rate=0.0,
            timestamp=datetime.now(),
            content_learned={
                "initial_topics": [
                    f"Introduction to {skill_name}",
                    f"Basic concepts of {skill_name}",
                    f"Getting started with {skill_name}"
                ]
            },
            questions_asked=[],
            practice_exercises=[]
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return JSONResponse({
            "success": True,
            "message": f"Started learning {skill_name}",
            "skill": {
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "level": skill.level,
                "mastery_score": skill.mastery_score
            },
            "session": {
                "id": session.id,
                "topic": session.topic,
                "started_at": session.timestamp.isoformat()
            }
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to start learning session"
        }, status_code=500)

@router.post("/api/skills/practice")
async def practice_skill(request: dict, db: Session = Depends(get_db)):
    """Practice an existing skill"""
    try:
        skill_id = request.get("skill_id")
        user_id = request.get("user_id", 1)
        
        if not skill_id:
            return JSONResponse({
                "success": False,
                "message": "Skill ID is required"
            }, status_code=400)
        
        skill = db.query(Skill).filter(
            Skill.id == skill_id,
            Skill.user_id == user_id
        ).first()
        
        if not skill:
            return JSONResponse({
                "success": False,
                "message": "Skill not found"
            }, status_code=404)
        
        # Update skill mastery
        current_mastery = skill.mastery_score or 0.0
        skill.mastery_score = min(1.0, current_mastery + 0.1)
        skill.last_updated = datetime.now()
        
        # Update level based on mastery
        if skill.mastery_score >= 0.8:
            skill.level = "expert"
        elif skill.mastery_score >= 0.5:
            skill.level = "intermediate"
        else:
            skill.level = "beginner"
        
        db.commit()
        
        # Create practice session
        session = LearningSession(
            user_id=user_id,
            skill_id=skill.id,
            topic=f"Practice: {skill.name}",
            duration=30,  # 30 minutes practice
            completion_rate=0.8,
            timestamp=datetime.now(),
            content_learned={
                "practice_topics": [
                    f"Advanced {skill.name} concepts",
                    f"Real-world {skill.name} applications",
                    f"Problem solving with {skill.name}"
                ]
            },
            questions_asked=[
                f"How to improve in {skill.name}?",
                f"What are best practices for {skill.name}?"
            ],
            practice_exercises=[
                f"Complete {skill.name} exercise 1",
                f"Solve {skill.name} challenge 2"
            ]
        )
        db.add(session)
        db.commit()
        
        return JSONResponse({
            "success": True,
            "message": f"Practiced {skill.name} successfully",
            "skill": {
                "id": skill.id,
                "name": skill.name,
                "level": skill.level,
                "mastery_score": skill.mastery_score,
                "mastery_improvement": 0.1
            },
            "session_id": session.id
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to practice skill"
        }, status_code=500)

@router.get("/api/skills/dashboard")
async def get_skills_dashboard(user_id: int = 1, db: Session = Depends(get_db)):
    """Get comprehensive skills dashboard"""
    try:
        # Get all skills
        skills = db.query(Skill).filter(Skill.user_id == user_id).all()
        
        # Get recent learning sessions
        recent_sessions = db.query(LearningSession).filter(
            LearningSession.user_id == user_id
        ).order_by(desc(LearningSession.timestamp)).limit(10).all()
        
        # Calculate statistics
        total_skills = len(skills)
        mastered_skills = len([s for s in skills if s.mastery_score and s.mastery_score >= 0.8])
        in_progress_skills = len([s for s in skills if s.mastery_score and 0.3 <= s.mastery_score < 0.8])
        beginner_skills = len([s for s in skills if not s.mastery_score or s.mastery_score < 0.3])
        
        # Skills by category
        category_stats = {}
        for skill in skills:
            cat = skill.category or "Uncategorized"
            if cat not in category_stats:
                category_stats[cat] = {"count": 0, "avg_mastery": 0}
            category_stats[cat]["count"] += 1
            category_stats[cat]["avg_mastery"] += (skill.mastery_score or 0)
        
        for cat in category_stats:
            if category_stats[cat]["count"] > 0:
                category_stats[cat]["avg_mastery"] /= category_stats[cat]["count"]
        
        # Learning activity (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        weekly_sessions = db.query(LearningSession).filter(
            LearningSession.user_id == user_id,
            LearningSession.timestamp >= week_ago
        ).all()
        
        return JSONResponse({
            "success": True,
            "statistics": {
                "total_skills": total_skills,
                "mastered_skills": mastered_skills,
                "in_progress_skills": in_progress_skills,
                "beginner_skills": beginner_skills,
                "weekly_sessions": len(weekly_sessions),
                "total_learning_hours": sum(s.duration for s in weekly_sessions) / 60 if weekly_sessions else 0
            },
            "skills_by_category": [
                {
                    "category": cat,
                    "count": stats["count"],
                    "avg_mastery": round(stats["avg_mastery"], 2)
                } for cat, stats in category_stats.items()
            ],
            "recent_skills": [
                {
                    "id": s.id,
                    "name": s.name,
                    "level": s.level,
                    "mastery_score": s.mastery_score or 0,
                    "last_updated": s.last_updated.isoformat() if s.last_updated else None
                } for s in skills[:5]
            ],
            "recent_sessions": [
                {
                    "id": session.id,
                    "topic": session.topic,
                    "duration": session.duration,
                    "completion_rate": session.completion_rate,
                    "timestamp": session.timestamp.isoformat() if session.timestamp else None
                } for session in recent_sessions
            ],
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to load skills dashboard"
        }, status_code=500)

@router.get("/api/skills/recommendations")
async def get_skill_recommendations(user_id: int = 1, db: Session = Depends(get_db)):
    """Get AI-powered skill recommendations"""
    try:
        # Get user's current skills
        user_skills = db.query(Skill).filter(Skill.user_id == user_id).all()
        skill_names = [skill.name.lower() for skill in user_skills]
        
        # Predefined skill recommendations based on popular tech skills
        all_recommendations = [
            {
                "name": "Python Programming",
                "category": "Programming",
                "difficulty": "beginner",
                "estimated_time": "4-6 weeks",
                "reason": "Essential programming language for AI and automation",
                "prerequisites": [],
                "next_skills": ["Machine Learning", "Web Development", "Data Analysis"]
            },
            {
                "name": "Machine Learning",
                "category": "AI/ML",
                "difficulty": "intermediate",
                "estimated_time": "8-12 weeks",
                "reason": "High demand skill for AI applications",
                "prerequisites": ["Python Programming", "Statistics"],
                "next_skills": ["Deep Learning", "Data Science", "Computer Vision"]
            },
            {
                "name": "Web Development",
                "category": "Programming",
                "difficulty": "beginner",
                "estimated_time": "6-8 weeks",
                "reason": "Versatile skill for building applications",
                "prerequisites": ["HTML/CSS"],
                "next_skills": ["Full Stack Development", "React", "Node.js"]
            },
            {
                "name": "Data Analysis",
                "category": "Data Science",
                "difficulty": "intermediate",
                "estimated_time": "6-8 weeks",
                "reason": "Critical skill for data-driven decisions",
                "prerequisites": ["Statistics", "Excel"],
                "next_skills": ["Data Visualization", "Business Intelligence", "SQL"]
            },
            {
                "name": "Cybersecurity",
                "category": "Security",
                "difficulty": "intermediate",
                "estimated_time": "10-12 weeks",
                "reason": "High-growth field with strong job security",
                "prerequisites": ["Networking", "Operating Systems"],
                "next_skills": ["Ethical Hacking", "Security Architecture", "Incident Response"]
            },
            {
                "name": "Cloud Computing",
                "category": "Infrastructure",
                "difficulty": "intermediate",
                "estimated_time": "8-10 weeks",
                "reason": "Essential for modern infrastructure",
                "prerequisites": ["Networking", "Linux"],
                "next_skills": ["DevOps", "Kubernetes", "Serverless Architecture"]
            },
            {
                "name": "Project Management",
                "category": "Management",
                "difficulty": "beginner",
                "estimated_time": "4-6 weeks",
                "reason": "Valuable leadership skill across industries",
                "prerequisites": [],
                "next_skills": ["Agile Methodology", "Product Management", "Team Leadership"]
            },
            {
                "name": "Digital Marketing",
                "category": "Marketing",
                "difficulty": "beginner",
                "estimated_time": "6-8 weeks",
                "reason": "Essential for business growth in digital age",
                "prerequisites": [],
                "next_skills": ["SEO", "Social Media Marketing", "Content Marketing"]
            }
        ]
        
        # Filter out skills user already has
        recommendations = [
            rec for rec in all_recommendations 
            if rec["name"].lower() not in skill_names
        ]
        
        # Limit to top 5 recommendations
        recommendations = recommendations[:5]
        
        return JSONResponse({
            "success": True,
            "recommendations": recommendations,
            "user_skills_count": len(user_skills),
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to get skill recommendations"
        }, status_code=500)

@router.delete("/api/skills/{skill_id}")
async def delete_skill(skill_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Delete a skill"""
    try:
        skill = db.query(Skill).filter(
            Skill.id == skill_id,
            Skill.user_id == user_id
        ).first()
        
        if not skill:
            return JSONResponse({
                "success": False,
                "message": "Skill not found"
            }, status_code=404)
        
        # Delete associated learning sessions
        db.query(LearningSession).filter(LearningSession.skill_id == skill_id).delete()
        
        # Delete the skill
        db.delete(skill)
        db.commit()
        
        return JSONResponse({
            "success": True,
            "message": f"Skill '{skill.name}' deleted successfully"
        })
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e),
            "message": "Failed to delete skill"
        }, status_code=500)
