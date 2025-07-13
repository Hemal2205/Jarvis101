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
    """Advanced skills learning and management system for J.A.R.V.I.S"""
    
    def __init__(self):
        self.skills_dir = "data/skills"
        self.sessions_dir = "data/learning_sessions"
        self.skills_db_file = "data/skills/skills_database.json"
        self.sessions_db_file = "data/learning_sessions/sessions_database.json"
        self.learning_progress_file = "data/skills/learning_progress.json"
        
        # In-memory storage
        self.skills: Dict[str, Skill] = {}
        self.learning_sessions: Dict[str, LearningSession] = {}
        self.learning_progress = {}
        self.active_learning_sessions = {}
        
        # AI and ML components
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.skill_embeddings = {}
        
        # Learning sources
        self.learning_sources = {
            "wikipedia": "https://en.wikipedia.org/api/rest_v1/page/summary/",
            "educational_apis": [],
            "documentation": [],
            "tutorials": []
        }
        
        # Initialize directories
        self._initialize_directories()
        
        # Load existing data
        self._load_skills_database()
        self._load_learning_sessions()
        self._load_learning_progress()
        
        # Start background learning process
        self.auto_learning_enabled = True
        self.learning_task = None
        
    def _initialize_directories(self):
        """Initialize required directories"""
        os.makedirs(self.skills_dir, exist_ok=True)
        os.makedirs(self.sessions_dir, exist_ok=True)
        
    def _load_skills_database(self):
        """Load skills database from file"""
        try:
            if os.path.exists(self.skills_db_file):
                with open(self.skills_db_file, 'r') as f:
                    skills_data = json.load(f)
                    self.skills = {
                        skill_id: Skill(**skill_data)
                        for skill_id, skill_data in skills_data.items()
                    }
        except Exception as e:
            logger.error(f"Error loading skills database: {e}")
            self.skills = {}
    
    def _save_skills_database(self):
        """Save skills database to file"""
        try:
            skills_data = {
                skill_id: asdict(skill)
                for skill_id, skill in self.skills.items()
            }
            with open(self.skills_db_file, 'w') as f:
                json.dump(skills_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving skills database: {e}")
    
    def _load_learning_sessions(self):
        """Load learning sessions from file"""
        try:
            if os.path.exists(self.sessions_db_file):
                with open(self.sessions_db_file, 'r') as f:
                    sessions_data = json.load(f)
                    self.learning_sessions = {
                        session_id: LearningSession(**session_data)
                        for session_id, session_data in sessions_data.items()
                    }
        except Exception as e:
            logger.error(f"Error loading learning sessions: {e}")
            self.learning_sessions = {}
    
    def _save_learning_sessions(self):
        """Save learning sessions to file"""
        try:
            sessions_data = {
                session_id: asdict(session)
                for session_id, session in self.learning_sessions.items()
            }
            with open(self.sessions_db_file, 'w') as f:
                json.dump(sessions_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving learning sessions: {e}")
    
    def _load_learning_progress(self):
        """Load learning progress from file"""
        try:
            if os.path.exists(self.learning_progress_file):
                with open(self.learning_progress_file, 'r') as f:
                    self.learning_progress = json.load(f)
        except Exception as e:
            logger.error(f"Error loading learning progress: {e}")
            self.learning_progress = {}
    
    def _save_learning_progress(self):
        """Save learning progress to file"""
        try:
            with open(self.learning_progress_file, 'w') as f:
                json.dump(self.learning_progress, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving learning progress: {e}")
    
    async def start_learning(self, topic: str, user_id: str = "default") -> Dict[str, Any]:
        """Start learning a new skill or topic"""
        try:
            # Check if skill already exists
            existing_skill = self._find_skill_by_name(topic)
            
            if existing_skill:
                return {
                    "success": False,
                    "message": f"Skill '{topic}' already exists. Use practice mode to improve it.",
                    "skill_id": existing_skill.id
                }
            
            # Create new skill
            skill_id = str(uuid.uuid4())
            skill = Skill(
                id=skill_id,
                name=topic,
                description=f"Learning {topic}",
                category=self._categorize_skill(topic),
                level="beginner",
                content=[],
                learned_at=datetime.now().isoformat(),
                last_updated=datetime.now().isoformat(),
                practice_count=0,
                mastery_score=0.0,
                sources=[],
                tags=self._generate_tags(topic),
                related_skills=[]
            )
            
            # Start learning session
            session_id = str(uuid.uuid4())
            learning_session = LearningSession(
                id=session_id,
                skill_id=skill_id,
                topic=topic,
                duration=0,
                content_learned=[],
                questions_asked=[],
                practice_exercises=[],
                completion_rate=0.0,
                timestamp=datetime.now().isoformat(),
                feedback=""
            )
            
            # Store in memory
            self.skills[skill_id] = skill
            self.learning_sessions[session_id] = learning_session
            self.active_learning_sessions[user_id] = session_id
            
            # Start gathering learning content
            await self._gather_learning_content(skill, learning_session)
            
            return {
                "success": True,
                "message": f"Started learning '{topic}'",
                "skill_id": skill_id,
                "session_id": session_id,
                "estimated_duration": "30-60 minutes",
                "content_overview": skill.content[:3] if skill.content else []
            }
            
        except Exception as e:
            logger.error(f"Error starting learning: {e}")
            return {
                "success": False,
                "message": f"Failed to start learning: {str(e)}"
            }
    
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
            self._save_skills_database()
            self._save_learning_sessions()
            
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
    
    async def get_learning_progress(self, user_id: str = "default") -> Dict[str, Any]:
        """Get current learning progress"""
        try:
            # Get active session
            active_session_id = self.active_learning_sessions.get(user_id)
            active_session = None
            
            if active_session_id:
                active_session = self.learning_sessions.get(active_session_id)
            
            # Calculate overall stats
            total_skills = len(self.skills)
            completed_skills = len([s for s in self.skills.values() if s.mastery_score > 0.7])
            in_progress_skills = len([s for s in self.skills.values() if 0 < s.mastery_score <= 0.7])
            
            # Get recent learning activity
            recent_sessions = sorted(
                self.learning_sessions.values(),
                key=lambda x: x.timestamp,
                reverse=True
            )[:5]
            
            # Calculate learning streak
            learning_streak = self._calculate_learning_streak()
            
            return {
                "total_skills": total_skills,
                "completed_skills": completed_skills,
                "in_progress_skills": in_progress_skills,
                "learning_streak": learning_streak,
                "active_session": asdict(active_session) if active_session else None,
                "recent_sessions": [asdict(session) for session in recent_sessions],
                "skill_categories": self._get_skill_categories_stats(),
                "recommendations": self._get_learning_recommendations()
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
    
    def _get_skill_categories_stats(self) -> Dict[str, int]:
        """Get statistics by skill category"""
        categories = {}
        
        for skill in self.skills.values():
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
            self._save_skills_database()
            self._save_learning_sessions()
            
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
    
    async def complete_learning_session(self, session_id: str, completion_rate: float, feedback: str = "") -> Dict[str, Any]:
        """Complete a learning session"""
        try:
            if session_id not in self.learning_sessions:
                return {"success": False, "message": "Session not found"}
            
            session = self.learning_sessions[session_id]
            skill = self.skills[session.skill_id]
            
            # Update session
            session.completion_rate = completion_rate
            session.feedback = feedback
            session.duration = (datetime.now() - datetime.fromisoformat(session.timestamp)).seconds // 60
            
            # Update skill mastery
            skill.mastery_score = min(1.0, skill.mastery_score + (completion_rate * 0.1))
            skill.last_updated = datetime.now().isoformat()
            
            # Update skill level based on mastery
            if skill.mastery_score >= 0.9:
                skill.level = "expert"
            elif skill.mastery_score >= 0.7:
                skill.level = "advanced"
            elif skill.mastery_score >= 0.4:
                skill.level = "intermediate"
            else:
                skill.level = "beginner"
            
            # Save progress
            self._save_skills_database()
            self._save_learning_sessions()
            
            return {
                "success": True,
                "message": f"Learning session completed",
                "skill_name": skill.name,
                "new_mastery_score": skill.mastery_score,
                "new_level": skill.level,
                "session_duration": session.duration
            }
            
        except Exception as e:
            logger.error(f"Error completing learning session: {e}")
            return {"success": False, "message": str(e)}
    
    async def get_skills_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive skills dashboard data"""
        try:
            skills_data = []
            
            for skill in self.skills.values():
                skill_data = asdict(skill)
                
                # Add additional stats
                skill_sessions = [s for s in self.learning_sessions.values() if s.skill_id == skill.id]
                skill_data["session_count"] = len(skill_sessions)
                skill_data["total_time_spent"] = sum(s.duration for s in skill_sessions)
                skill_data["avg_completion_rate"] = (
                    sum(s.completion_rate for s in skill_sessions) / len(skill_sessions)
                    if skill_sessions else 0
                )
                
                skills_data.append(skill_data)
            
            # Sort by mastery score
            skills_data.sort(key=lambda x: x["mastery_score"], reverse=True)
            
            return {
                "skills": skills_data,
                "summary": {
                    "total_skills": len(self.skills),
                    "total_sessions": len(self.learning_sessions),
                    "categories": self._get_skill_categories_stats(),
                    "learning_streak": self._calculate_learning_streak(),
                    "total_learning_time": sum(s.duration for s in self.learning_sessions.values())
                },
                "recommendations": self._get_learning_recommendations()
            }
            
        except Exception as e:
            logger.error(f"Error getting skills dashboard: {e}")
            return {"error": str(e)}
    
    async def search_skills(self, query: str) -> List[Dict[str, Any]]:
        """Search for skills by name or content"""
        try:
            results = []
            query_lower = query.lower()
            
            for skill in self.skills.values():
                # Check name match
                if query_lower in skill.name.lower():
                    results.append({
                        "skill": asdict(skill),
                        "match_type": "name",
                        "relevance": 1.0
                    })
                    continue
                
                # Check content match
                content_matches = sum(1 for content in skill.content if query_lower in content.lower())
                if content_matches > 0:
                    results.append({
                        "skill": asdict(skill),
                        "match_type": "content",
                        "relevance": content_matches / len(skill.content) if skill.content else 0
                    })
                    continue
                
                # Check tags match
                if any(query_lower in tag.lower() for tag in skill.tags):
                    results.append({
                        "skill": asdict(skill),
                        "match_type": "tags",
                        "relevance": 0.7
                    })
            
            # Sort by relevance
            results.sort(key=lambda x: x["relevance"], reverse=True)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching skills: {e}")
            return []
    
    def get_status(self) -> Dict[str, Any]:
        """Get skills manager status"""
        return {
            "total_skills": len(self.skills),
            "active_sessions": len(self.active_learning_sessions),
            "auto_learning_enabled": self.auto_learning_enabled,
            "learning_sources": list(self.learning_sources.keys()),
            "skill_categories": list(self._get_skill_categories_stats().keys())
        }
    
    async def shutdown(self):
        """Shutdown the skills manager"""
        if self.learning_task:
            self.learning_task.cancel()
        
        # Save all data
        self._save_skills_database()
        self._save_learning_sessions()
        self._save_learning_progress()
        
        logger.info("Skills manager shutdown complete")