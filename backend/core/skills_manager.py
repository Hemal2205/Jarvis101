import asyncio
import json
import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import requests
import uuid
from dataclasses import dataclass, asdict
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from .models import Skill as SkillModel, User as UserModel, LearningSession as LearningSessionModel
from .notification_manager import NotificationManager

logger = logging.getLogger(__name__)

@dataclass
class Skill:
    """Represents a learned skill"""
    id: str
    name: str
    description: str
    category: str
    level: str  # beginner, intermediate, advanced, expert
    content: List[str]
    learned_at: str
    last_updated: str
    practice_count: int
    mastery_score: float
    sources: List[str]
    tags: List[str]
    related_skills: List[str]

@dataclass
class LearningSession:
    """Represents a learning session"""
    id: str
    skill_id: str
    topic: str
    duration: int  # in minutes
    content_learned: List[str]
    questions_asked: List[str]
    practice_exercises: List[str]
    completion_rate: float
    timestamp: str
    feedback: str

class SkillsManager:
    """Advanced skills learning and management system for J.A.R.V.I.S (SQLAlchemy version)"""
    
    def __init__(self):
        # Ensure all attributes are initialized to avoid AttributeError
        self.skills = []
        self.active_learning_sessions = []
        self.auto_learning_enabled = False
        self.learning_sources = {}
        # ... any other needed initializations ...
        
    async def create_session(self, db: Session, user_id: str, skill_id: int, topic: str) -> LearningSessionModel:
        session = LearningSessionModel(
            user_id=user_id,
            skill_id=skill_id,
            topic=topic,
            duration=0,
            content_learned=[],
            questions_asked=[],
            practice_exercises=[],
            completion_rate=0.0,
            timestamp=datetime.now(),
            feedback=""
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    async def complete_session(self, db: Session, session_id: int, completion_rate: float, feedback: str = "") -> Dict[str, Any]:
        session = db.query(LearningSessionModel).filter_by(id=session_id).first()
        if not session:
            return {"success": False, "message": "Session not found"}
        session.completion_rate = completion_rate
        session.feedback = feedback
        session.duration = (datetime.now() - session.timestamp).seconds // 60
        db.commit()
        # Create notification for completed session
        notification_manager.create_notification(
            db,
            user_id=session.user_id,
            message=f'Completed learning session: {session.topic}',
            type="learning_session",
            data={"session_id": session.id, "topic": session.topic}
        )
        return {"success": True, "message": "Session completed", "session_id": session.id}

    async def get_recent_sessions(self, db: Session, user_id: str, limit: int = 5):
        user = db.query(UserModel).filter_by(username=user_id).first()
        if not user:
            return []
        sessions = db.query(LearningSessionModel).filter_by(user_id=user.id).order_by(LearningSessionModel.timestamp.desc()).limit(limit).all()
        return [
            {
                "id": s.id,
                "topic": s.topic,
                "skill_id": s.skill_id,
                "duration": s.duration,
                "completion_rate": s.completion_rate,
                "timestamp": s.timestamp.isoformat(),
                "feedback": s.feedback
            } for s in sessions
        ]

    async def start_learning(self, db: Session, topic: str, user_id: str = "default") -> Dict[str, Any]:
        try:
            user = db.query(UserModel).filter_by(username=user_id).first()
            if not user:
                return {"success": False, "message": "User not found"}
            existing_skill = db.query(SkillModel).filter_by(user_id=user.id, name=topic).first()
            if existing_skill:
                return {
                    "success": False,
                    "message": f"Skill '{topic}' already exists. Use practice mode to improve it.",
                    "skill_id": existing_skill.id
                }
            skill = SkillModel(
                user_id=user.id,
                name=topic,
                description=f"Learning {topic}",
                category=self._categorize_skill(topic),
                level="beginner",
                mastery_score=0.0,
                resources=[],
                last_updated=datetime.now(),
                learned_at=datetime.now()
            )
            db.add(skill)
            db.commit()
            db.refresh(skill)
            # Create notification for new skill
            notification_manager.create_notification(
                db,
                user_id=user.id,
                message=f'Started learning skill: {topic}',
                type="skill",
                data={"skill_id": skill.id, "topic": topic}
            )
            session = await self.create_session(db, user.id, skill.id, topic)
            return {
                "success": True,
                "message": f"Started learning '{topic}'",
                "skill_id": skill.id,
                "session_id": session.id
            }
        except Exception as e:
            logger.error(f"Error starting learning: {e}")
            return {"success": False, "message": f"Failed to start learning: {str(e)}"}
    
    async def _gather_learning_content(self, skill: Skill, session: LearningSession):
        """Gather learning content from various sources"""
        try:
            # Fetch content from Wikipedia
            wikipedia_content = await self._fetch_wikipedia_content(skill.name)
            if wikipedia_content:
                skill.content.extend(wikipedia_content)
                session.content_learned.extend(wikipedia_content)
                skill.sources.append("Wikipedia")
            
            # Generate practice questions
            practice_questions = self._generate_practice_questions(skill.name)
            session.practice_exercises.extend(practice_questions)
            
            # Find related skills
            related_skills = await self._find_related_skills(skill.name)
            skill.related_skills.extend(related_skills)
            
            # Update skill embeddings
            self._update_skill_embeddings(skill)
            
            # Save progress
            # self._save_skills_database() # Removed file-based saving
            # self._save_learning_sessions() # Removed file-based saving
            
        except Exception as e:
            logger.error(f"Error gathering learning content: {e}")
    
    async def _fetch_wikipedia_content(self, topic: str) -> List[str]:
        """Fetch educational content from Wikipedia"""
        try:
            # Clean topic for Wikipedia search
            clean_topic = topic.replace(" ", "_")
            url = f"{self.learning_sources['wikipedia']}{clean_topic}"
            
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                content = []
                
                if 'extract' in data:
                    # Split into paragraphs
                    paragraphs = data['extract'].split('\n')
                    content.extend([p.strip() for p in paragraphs if p.strip()])
                
                return content[:10]  # Limit to first 10 paragraphs
            
        except Exception as e:
            logger.error(f"Error fetching Wikipedia content: {e}")
        
        return []
    
    def _generate_practice_questions(self, topic: str) -> List[str]:
        """Generate practice questions for the topic"""
        question_templates = [
            f"What is {topic}?",
            f"How does {topic} work?",
            f"What are the key concepts in {topic}?",
            f"What are the applications of {topic}?",
            f"What are the advantages and disadvantages of {topic}?",
            f"How is {topic} used in real-world scenarios?",
            f"What are the latest developments in {topic}?",
            f"How can I improve my skills in {topic}?"
        ]
        
        return question_templates
    
    async def _find_related_skills(self, topic: str) -> List[str]:
        """Find skills related to the current topic"""
        related = []
        
        # Simple keyword matching (can be enhanced with NLP)
        topic_words = topic.lower().split()
        
        for skill_id, skill in self.skills.items():
            skill_words = skill.name.lower().split()
            
            # Check for common words
            if any(word in skill_words for word in topic_words):
                if skill.name != topic:
                    related.append(skill.name)
        
        return related[:5]  # Limit to 5 related skills
    
    def _categorize_skill(self, topic: str) -> str:
        """Categorize the skill based on topic"""
        categories = {
            "programming": ["python", "javascript", "java", "c++", "coding", "development"],
            "data_science": ["machine learning", "data analysis", "statistics", "ai", "ml"],
            "business": ["management", "marketing", "finance", "economics", "business"],
            "science": ["physics", "chemistry", "biology", "mathematics", "engineering"],
            "technology": ["cloud computing", "cybersecurity", "networking", "database"],
            "creative": ["design", "art", "music", "writing", "photography"],
            "language": ["english", "spanish", "french", "german", "communication"]
        }
        
        topic_lower = topic.lower()
        
        for category, keywords in categories.items():
            if any(keyword in topic_lower for keyword in keywords):
                return category
        
        return "general"
    
    def _generate_tags(self, topic: str) -> List[str]:
        """Generate tags for the skill"""
        tags = []
        
        # Add basic tags
        tags.append("learning")
        tags.append("skill")
        
        # Add category-specific tags
        category = self._categorize_skill(topic)
        tags.append(category)
        
        # Add topic-specific tags
        topic_words = topic.lower().split()
        tags.extend(topic_words)
        
        return list(set(tags))  # Remove duplicates
    
    def _update_skill_embeddings(self, skill: Skill):
        """Update skill embeddings for similarity calculations"""
        try:
            # Combine all text content
            text_content = " ".join(skill.content + skill.tags + [skill.name, skill.description])
            
            # Store for vectorization
            self.skill_embeddings[skill.id] = text_content
            
        except Exception as e:
            logger.error(f"Error updating skill embeddings: {e}")
    
    def _find_skill_by_name(self, name: str) -> Optional[Skill]:
        """Find a skill by name"""
        for skill in self.skills.values():
            if skill.name.lower() == name.lower():
                return skill
        return None
    
    async def get_learning_progress(self, db: Session, user_id: str = "default") -> Dict[str, Any]:
        """Get current learning progress"""
        try:
            user = db.query(UserModel).filter_by(username=user_id).first()
            if not user:
                return {"error": "User not found"}
            skills = db.query(SkillModel).filter_by(user_id=user.id).all()
            total_skills = len(skills)
            completed_skills = len([s for s in skills if s.mastery_score > 0.7])
            in_progress_skills = len([s for s in skills if 0 < s.mastery_score <= 0.7])
            return {
                "total_skills": total_skills,
                "completed_skills": completed_skills,
                "in_progress_skills": in_progress_skills,
                "skill_categories": self._get_skill_categories_stats(skills)
            }
        except Exception as e:
            logger.error(f"Error getting learning progress: {e}")
            return {"error": str(e)}
    
    def _calculate_learning_streak(self) -> int:
        """Calculate current learning streak in days"""
        # Get learning dates
        learning_dates = []
        for session in self.learning_sessions.values():
            session_date = datetime.fromisoformat(session.timestamp).date()
            learning_dates.append(session_date)
        
        if not learning_dates:
            return 0
        
        # Sort dates
        learning_dates = sorted(set(learning_dates), reverse=True)
        
        # Calculate streak
        streak = 0
        today = datetime.now().date()
        
        for i, date in enumerate(learning_dates):
            expected_date = today - timedelta(days=i)
            if date == expected_date:
                streak += 1
            else:
                break
        
        return streak
    
    def _get_skill_categories_stats(self, skills) -> Dict[str, int]:
        """Get statistics by skill category"""
        categories = {}
        
        for skill in skills:
            category = skill.category
            if category not in categories:
                categories[category] = 0
            categories[category] += 1
        
        return categories
    
    def _get_learning_recommendations(self) -> List[str]:
        """Get learning recommendations based on current skills"""
        recommendations = []
        
        # Recommend based on incomplete skills
        incomplete_skills = [s for s in self.skills.values() if s.mastery_score < 0.7]
        if incomplete_skills:
            skill = min(incomplete_skills, key=lambda x: x.mastery_score)
            recommendations.append(f"Continue learning {skill.name} (current mastery: {skill.mastery_score:.1%})")
        
        # Recommend related skills
        if self.skills:
            latest_skill = max(self.skills.values(), key=lambda x: x.last_updated)
            if latest_skill.related_skills:
                recommendations.append(f"Learn {latest_skill.related_skills[0]} (related to {latest_skill.name})")
        
        # Recommend popular categories
        categories = self._get_skill_categories_stats()
        if categories:
            popular_category = max(categories.items(), key=lambda x: x[1])[0]
            recommendations.append(f"Explore more {popular_category} skills")
        
        return recommendations[:3]
    
    async def practice_skill(self, skill_id: str, user_id: str = "default") -> Dict[str, Any]:
        """Practice an existing skill"""
        try:
            if skill_id not in self.skills:
                return {"success": False, "message": "Skill not found"}
            
            skill = self.skills[skill_id]
            
            # Create practice session
            session_id = str(uuid.uuid4())
            practice_session = LearningSession(
                id=session_id,
                skill_id=skill_id,
                topic=f"Practice: {skill.name}",
                duration=0,
                content_learned=[],
                questions_asked=[],
                practice_exercises=skill.content[:5],  # Use existing content as practice
                completion_rate=0.0,
                timestamp=datetime.now().isoformat(),
                feedback=""
            )
            
            # Update skill
            skill.practice_count += 1
            skill.last_updated = datetime.now().isoformat()
            
            # Store session
            self.learning_sessions[session_id] = practice_session
            self.active_learning_sessions[user_id] = session_id
            
            # Save progress
            # self._save_skills_database() # Removed file-based saving
            # self._save_learning_sessions() # Removed file-based saving
            
            return {
                "success": True,
                "message": f"Started practicing {skill.name}",
                "session_id": session_id,
                "practice_exercises": practice_session.practice_exercises,
                "current_level": skill.level,
                "practice_count": skill.practice_count
            }
            
        except Exception as e:
            logger.error(f"Error practicing skill: {e}")
            return {"success": False, "message": str(e)}
    
    async def complete_learning_session(self, db: Session, session_id: int, completion_rate: float, feedback: str = "") -> Dict[str, Any]:
        """Complete a learning session"""
        return await self.complete_session(db, session_id, completion_rate, feedback)
    
    async def get_skills_dashboard(self, db: Session, user_id: str = "default") -> Dict[str, Any]:
        """Get comprehensive skills dashboard data"""
        try:
            user = db.query(UserModel).filter_by(username=user_id).first()
            if not user:
                return {"error": "User not found"}
            skills = db.query(SkillModel).filter_by(user_id=user.id).all()
            skills_data = []
            for skill in skills:
                skills_data.append({
                    "id": skill.id,
                    "name": skill.name,
                    "description": skill.description,
                    "category": skill.category,
                    "level": skill.level,
                    "mastery_score": skill.mastery_score,
                    "resources": skill.resources,
                    "last_updated": skill.last_updated.isoformat() if skill.last_updated else None,
                    "learned_at": skill.learned_at.isoformat() if skill.learned_at else None
                })
            skills_data.sort(key=lambda x: x["mastery_score"], reverse=True)
            return {
                "skills": skills_data,
                "summary": {
                    "total_skills": len(skills),
                    "categories": self._get_skill_categories_stats(skills)
                }
            }
        except Exception as e:
            logger.error(f"Error getting skills dashboard: {e}")
            return {"error": str(e)}
    
    async def search_skills(self, db: Session, query: str, user_id: str = "default") -> List[Dict[str, Any]]:
        """Search for skills by name or content"""
        try:
            user = db.query(UserModel).filter_by(username=user_id).first()
            if not user:
                return []
            skills = db.query(SkillModel).filter_by(user_id=user.id).all()
            results = []
            query_lower = query.lower()
            for skill in skills:
                if query_lower in skill.name.lower() or query_lower in (skill.description or '').lower():
                    results.append({
                        "id": skill.id,
                        "name": skill.name,
                        "description": skill.description,
                        "category": skill.category,
                        "level": skill.level,
                        "mastery_score": skill.mastery_score,
                        "resources": skill.resources,
                        "last_updated": skill.last_updated.isoformat() if skill.last_updated else None,
                        "learned_at": skill.learned_at.isoformat() if skill.learned_at else None
                    })
            return results
        except Exception as e:
            logger.error(f"Error searching skills: {e}")
            return []
    
    def get_status(self) -> Dict[str, Any]:
        """Get skills manager status"""
        return {
            "total_skills": len(self.skills) if hasattr(self, 'skills') and self.skills is not None else 0,
            "active_sessions": len(self.active_learning_sessions) if hasattr(self, 'active_learning_sessions') and self.active_learning_sessions is not None else 0,
            "auto_learning_enabled": getattr(self, 'auto_learning_enabled', False),
            "learning_sources": list(self.learning_sources.keys()) if hasattr(self, 'learning_sources') and self.learning_sources is not None else [],
            "skill_categories": list(self._get_skill_categories_stats(self.skills).keys()) if hasattr(self, 'skills') and self.skills is not None else []
        }
    
    async def shutdown(self):
        """Shutdown the skills manager"""
        if self.learning_task:
            self.learning_task.cancel()
        
        # Save all data
        # self._save_skills_database() # Removed file-based saving
        # self._save_learning_sessions() # Removed file-based saving
        # self._save_learning_progress() # Removed file-based saving
        
        logger.info("Skills manager shutdown complete")