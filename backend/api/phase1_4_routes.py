from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api", tags=["phase1_4"])

# ============================================================================
# ADVANCED LEARNING & SKILL DEVELOPMENT
# ============================================================================

class SkillCreate(BaseModel):
    name: str
    category: str
    target_level: str
    description: str = ""

class Skill(BaseModel):
    id: str
    name: str
    category: str
    current_level: str
    target_level: str
    progress_percentage: int
    xp_points: int
    total_xp_needed: int
    learning_path: List[Dict[str, Any]]
    related_skills: List[str]
    last_practiced: str
    mastery_score: int
    time_spent: int
    achievements: List[Dict[str, Any]]
    resources: List[Dict[str, Any]]

class LearningAnalytics(BaseModel):
    total_skills: int
    skills_in_progress: int
    skills_completed: int
    total_xp: int
    learning_streak: int
    weekly_goal_progress: int
    recommended_skills: List[Dict[str, Any]]
    learning_patterns: Dict[str, Any]
    skill_gaps: List[Dict[str, Any]]

class AIRecommendation(BaseModel):
    skill_id: str
    reason: str
    confidence: int
    suggested_action: str
    estimated_impact: str
    time_commitment: int

# Mock data for learning features
mock_skills = [
    {
        "id": "skill_001",
        "name": "Python Programming",
        "category": "programming",
        "current_level": "intermediate",
        "target_level": "advanced",
        "progress_percentage": 75,
        "xp_points": 1500,
        "total_xp_needed": 2000,
        "learning_path": [
            {
                "id": "path_001",
                "title": "Advanced Python Concepts",
                "description": "Master advanced Python features",
                "difficulty": "advanced",
                "estimated_duration": 120,
                "prerequisites": [],
                "resources": ["resource_001", "resource_002"],
                "status": "in_progress",
                "progress": 60
            }
        ],
        "related_skills": ["JavaScript", "Data Science"],
        "last_practiced": "2024-01-15T14:30:00Z",
        "mastery_score": 85,
        "time_spent": 1800,
        "achievements": [
            {
                "id": "ach_001",
                "name": "Python Novice",
                "description": "Complete basic Python course",
                "icon": "🐍",
                "unlocked_at": "2024-01-10T10:00:00Z",
                "rarity": "common",
                "xp_reward": 100
            }
        ],
        "resources": [
            {
                "id": "resource_001",
                "title": "Python Advanced Tutorial",
                "type": "video",
                "url": "https://example.com/python-advanced",
                "duration": 45,
                "difficulty": "advanced",
                "rating": 4.5,
                "completed": False,
                "tags": ["python", "advanced", "tutorial"],
                "description": "Comprehensive advanced Python concepts"
            }
        ]
    }
]

@router.get("/learning/skills")
async def get_skills():
    """Get all skills with learning progress"""
    return {
        "success": True,
        "skills": mock_skills
    }

@router.post("/learning/skills")
async def create_skill(skill: SkillCreate):
    """Create a new skill"""
    new_skill = {
        "id": f"skill_{len(mock_skills) + 1:03d}",
        "name": skill.name,
        "category": skill.category,
        "current_level": "beginner",
        "target_level": skill.target_level,
        "progress_percentage": 0,
        "xp_points": 0,
        "total_xp_needed": 1000,
        "learning_path": [],
        "related_skills": [],
        "last_practiced": datetime.now().isoformat(),
        "mastery_score": 0,
        "time_spent": 0,
        "achievements": [],
        "resources": []
    }
    
    mock_skills.append(new_skill)
    return {"success": True, "skill": new_skill}

@router.get("/learning/analytics")
async def get_learning_analytics():
    """Get learning analytics and insights"""
    analytics = {
        "total_skills": len(mock_skills),
        "skills_in_progress": len([s for s in mock_skills if s["progress_percentage"] > 0 and s["progress_percentage"] < 100]),
        "skills_completed": len([s for s in mock_skills if s["progress_percentage"] == 100]),
        "total_xp": sum(s["xp_points"] for s in mock_skills),
        "learning_streak": random.randint(5, 30),
        "weekly_goal_progress": random.randint(60, 95),
        "recommended_skills": [
            {
                "id": "skill_002",
                "name": "Machine Learning",
                "category": "programming",
                "reason": "High demand in current market"
            }
        ],
        "learning_patterns": {
            "preferred_time": "09:00",
            "preferred_duration": 45,
            "most_productive_day": "Tuesday"
        },
        "skill_gaps": [
            {
                "skill_id": "skill_003",
                "gap_reason": "Missing foundational knowledge",
                "recommended_resources": ["resource_003", "resource_004"]
            }
        ]
    }
    return {"success": True, "analytics": analytics}

@router.get("/learning/recommendations")
async def get_learning_recommendations():
    """Get AI-powered learning recommendations"""
    recommendations = [
        {
            "skill_id": "skill_001",
            "reason": "High progress rate suggests readiness for advanced concepts",
            "confidence": 92,
            "suggested_action": "practice_more",
            "estimated_impact": "high",
            "time_commitment": 30
        },
        {
            "skill_id": "skill_002",
            "reason": "Complementary to your current Python skills",
            "confidence": 85,
            "suggested_action": "start_learning",
            "estimated_impact": "medium",
            "time_commitment": 45
        }
    ]
    return {"success": True, "recommendations": recommendations}

@router.post("/learning/skills/{skill_id}/start")
async def start_learning(skill_id: str):
    """Start a learning session"""
    skill = next((s for s in mock_skills if s["id"] == skill_id), None)
    if skill:
        skill["last_practiced"] = datetime.now().isoformat()
        return {"success": True}
    raise HTTPException(status_code=404, detail="Skill not found")

@router.post("/learning/skills/{skill_id}/resources/{resource_id}/complete")
async def complete_resource(skill_id: str, resource_id: str):
    """Complete a learning resource"""
    skill = next((s for s in mock_skills if s["id"] == skill_id), None)
    if skill:
        resource = next((r for r in skill["resources"] if r["id"] == resource_id), None)
        if resource:
            resource["completed"] = True
            skill["xp_points"] += 50
            skill["progress_percentage"] = min(100, skill["progress_percentage"] + 5)
            return {"success": True, "xp_gained": 50}
    raise HTTPException(status_code=404, detail="Skill or resource not found")

# ============================================================================
# ENVIRONMENTAL & HEALTH INTEGRATION
# ============================================================================

class HealthData(BaseModel):
    id: str
    metric: str
    value: float
    unit: str
    timestamp: str
    status: str
    target_range: Dict[str, float]
    trend: str
    notes: Optional[str] = None

class EnvironmentalData(BaseModel):
    id: str
    metric: str
    value: float
    unit: str
    timestamp: str
    status: str
    target_range: Dict[str, float]
    location: str
    recommendations: List[str]

class HealthReminder(BaseModel):
    id: str
    type: str
    title: str
    description: str
    frequency: str
    time: str
    enabled: bool
    last_triggered: Optional[str] = None
    next_trigger: Optional[str] = None
    completed_today: bool

class WearableDevice(BaseModel):
    id: str
    name: str
    type: str
    brand: str
    model: str
    connected: bool
    battery_level: int
    last_sync: str
    capabilities: List[str]
    data_sources: List[str]

class WellnessAnalytics(BaseModel):
    overall_health_score: int
    daily_goals: Dict[str, Dict[str, Any]]
    weekly_trends: Dict[str, List[int]]
    environmental_impact: Dict[str, Any]
    health_insights: Dict[str, Any]

# Mock data for health features
mock_health_data = [
    {
        "id": "health_001",
        "metric": "heart_rate",
        "value": 72,
        "unit": "BPM",
        "timestamp": datetime.now().isoformat(),
        "status": "good",
        "target_range": {"min": 60, "max": 100},
        "trend": "stable",
        "notes": "Resting heart rate within normal range"
    },
    {
        "id": "health_002",
        "metric": "steps",
        "value": 8500,
        "unit": "steps",
        "timestamp": datetime.now().isoformat(),
        "status": "good",
        "target_range": {"min": 8000, "max": 12000},
        "trend": "up",
        "notes": "Good daily activity level"
    },
    {
        "id": "health_003",
        "metric": "sleep",
        "value": 7.5,
        "unit": "hours",
        "timestamp": datetime.now().isoformat(),
        "status": "excellent",
        "target_range": {"min": 7, "max": 9},
        "trend": "stable",
        "notes": "Optimal sleep duration"
    },
    {
        "id": "health_004",
        "metric": "hydration",
        "value": 2.1,
        "unit": "L",
        "timestamp": datetime.now().isoformat(),
        "status": "good",
        "target_range": {"min": 2, "max": 3},
        "trend": "up",
        "notes": "Good hydration level"
    }
]

mock_environmental_data = [
    {
        "id": "env_001",
        "metric": "air_quality",
        "value": 85,
        "unit": "AQI",
        "timestamp": datetime.now().isoformat(),
        "status": "good",
        "target_range": {"min": 0, "max": 100},
        "location": "Office",
        "recommendations": ["Good air quality", "Consider opening windows for fresh air"]
    },
    {
        "id": "env_002",
        "metric": "temperature",
        "value": 22.5,
        "unit": "°C",
        "timestamp": datetime.now().isoformat(),
        "status": "excellent",
        "target_range": {"min": 20, "max": 25},
        "location": "Office",
        "recommendations": ["Optimal temperature for productivity"]
    },
    {
        "id": "env_003",
        "metric": "noise_level",
        "value": 45,
        "unit": "dB",
        "timestamp": datetime.now().isoformat(),
        "status": "good",
        "target_range": {"min": 30, "max": 60},
        "location": "Office",
        "recommendations": ["Acceptable noise level", "Consider noise-canceling headphones if needed"]
    },
    {
        "id": "env_004",
        "metric": "light_level",
        "value": 500,
        "unit": "lux",
        "timestamp": datetime.now().isoformat(),
        "status": "good",
        "target_range": {"min": 300, "max": 750},
        "location": "Office",
        "recommendations": ["Good lighting for work", "Consider natural light sources"]
    }
]

mock_reminders = [
    {
        "id": "reminder_001",
        "type": "hydration",
        "title": "Stay Hydrated",
        "description": "Drink a glass of water",
        "frequency": "hourly",
        "time": "10:00",
        "enabled": True,
        "last_triggered": "2024-01-15T10:00:00Z",
        "next_trigger": "2024-01-15T11:00:00Z",
        "completed_today": False
    },
    {
        "id": "reminder_002",
        "type": "posture",
        "title": "Check Posture",
        "description": "Sit up straight and adjust your posture",
        "frequency": "daily",
        "time": "14:00",
        "enabled": True,
        "last_triggered": "2024-01-15T14:00:00Z",
        "next_trigger": "2024-01-16T14:00:00Z",
        "completed_today": True
    },
    {
        "id": "reminder_003",
        "type": "break",
        "title": "Take a Break",
        "description": "Step away from your desk for 5 minutes",
        "frequency": "daily",
        "time": "15:30",
        "enabled": True,
        "last_triggered": None,
        "next_trigger": "2024-01-15T15:30:00Z",
        "completed_today": False
    }
]

mock_devices = [
    {
        "id": "device_001",
        "name": "Apple Watch Series 8",
        "type": "smartwatch",
        "brand": "Apple",
        "model": "Series 8",
        "connected": True,
        "battery_level": 85,
        "last_sync": datetime.now().isoformat(),
        "capabilities": ["Heart Rate", "Steps", "Sleep", "ECG"],
        "data_sources": ["heart_rate", "steps", "sleep", "calories"]
    },
    {
        "id": "device_002",
        "name": "Air Quality Monitor",
        "type": "air_monitor",
        "brand": "Dyson",
        "model": "Pure Cool",
        "connected": True,
        "battery_level": 100,
        "last_sync": datetime.now().isoformat(),
        "capabilities": ["Air Quality", "Temperature", "Humidity"],
        "data_sources": ["air_quality", "temperature", "humidity"]
    }
]

mock_wellness_analytics = {
    "overall_health_score": 87,
    "daily_goals": {
        "steps": {"target": 10000, "current": 8500, "percentage": 85},
        "hydration": {"target": 2.5, "current": 2.1, "percentage": 84},
        "sleep": {"target": 8, "current": 7.5, "percentage": 94},
        "exercise": {"target": 30, "current": 25, "percentage": 83}
    },
    "weekly_trends": {
        "heart_rate": [72, 71, 73, 70, 72, 71, 72],
        "sleep_quality": [85, 88, 82, 90, 87, 85, 89],
        "stress_level": [30, 25, 35, 20, 30, 25, 28],
        "activity_level": [75, 80, 70, 85, 78, 82, 79]
    },
    "environmental_impact": {
        "air_quality_score": 85,
        "noise_exposure": 45,
        "light_exposure": 500,
        "recommendations": [
            "Maintain current air quality",
            "Consider natural lighting",
            "Monitor noise levels during meetings"
        ]
    },
    "health_insights": {
        "sleep_pattern": "Consistent 7-8 hours with good quality",
        "stress_triggers": ["Work deadlines", "Screen time"],
        "productivity_correlation": 0.85,
        "recommendations": [
            "Maintain current sleep schedule",
            "Take regular breaks from screens",
            "Continue daily exercise routine"
        ]
    }
}

@router.get("/health/data")
async def get_health_data():
    """Get health metrics data"""
    return {
        "success": True,
        "health_data": mock_health_data
    }

@router.get("/health/environmental")
async def get_environmental_data():
    """Get environmental monitoring data"""
    return {
        "success": True,
        "environmental_data": mock_environmental_data
    }

@router.get("/health/reminders")
async def get_reminders():
    """Get health reminders"""
    return {
        "success": True,
        "reminders": mock_reminders
    }

@router.post("/health/reminders")
async def create_reminder(reminder: Dict[str, Any]):
    """Create a new health reminder"""
    new_reminder = {
        "id": f"reminder_{len(mock_reminders) + 1:03d}",
        "type": reminder["type"],
        "title": reminder["title"],
        "description": reminder["description"],
        "frequency": reminder["frequency"],
        "time": reminder["time"],
        "enabled": reminder["enabled"],
        "last_triggered": None,
        "next_trigger": datetime.now().isoformat(),
        "completed_today": False
    }
    
    mock_reminders.append(new_reminder)
    return {"success": True, "reminder": new_reminder}

@router.post("/health/reminders/{reminder_id}/toggle")
async def toggle_reminder(reminder_id: str, request: Dict[str, bool]):
    """Toggle reminder enabled/disabled"""
    reminder = next((r for r in mock_reminders if r["id"] == reminder_id), None)
    if reminder:
        reminder["enabled"] = request["enabled"]
        return {"success": True}
    raise HTTPException(status_code=404, detail="Reminder not found")

@router.post("/health/reminders/{reminder_id}/complete")
async def complete_reminder(reminder_id: str):
    """Mark reminder as completed"""
    reminder = next((r for r in mock_reminders if r["id"] == reminder_id), None)
    if reminder:
        reminder["completed_today"] = True
        reminder["last_triggered"] = datetime.now().isoformat()
        return {"success": True}
    raise HTTPException(status_code=404, detail="Reminder not found")

@router.get("/health/devices")
async def get_devices():
    """Get connected wearable devices"""
    return {
        "success": True,
        "devices": mock_devices
    }

@router.get("/health/analytics")
async def get_wellness_analytics():
    """Get wellness analytics"""
    return {
        "success": True,
        "analytics": mock_wellness_analytics
    }

@router.post("/health/monitoring/start")
async def start_monitoring():
    """Start health monitoring"""
    return {"success": True, "message": "Health monitoring started"}

@router.post("/health/monitoring/stop")
async def stop_monitoring():
    """Stop health monitoring"""
    return {"success": True, "message": "Health monitoring stopped"} 