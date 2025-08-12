from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/healthai", tags=["predictive_health"])

class HealthPrediction(BaseModel):
    type: str
    risk: str
    score: int
    trend: str
    message: str

class HealthRecommendation(BaseModel):
    id: str
    title: str
    description: str
    type: str
    action_label: str

class DeviceStatus(BaseModel):
    id: str
    name: str
    type: str
    connected: bool
    last_sync: str

# Mock data
mock_predictions = [
    HealthPrediction(type='stress', risk='moderate', score=65, trend='up', message='Stress levels are rising. Consider a break.'),
    HealthPrediction(type='fatigue', risk='low', score=30, trend='down', message='Fatigue is low. Keep up the good work!'),
    HealthPrediction(type='hydration', risk='high', score=85, trend='up', message='Hydration is low. Drink water soon.')
]
mock_recommendations = [
    HealthRecommendation(id='r1', title='Take a Short Break', description='Stand up and stretch for 5 minutes.', type='break', action_label='Start Break'),
    HealthRecommendation(id='r2', title='Drink Water', description='Hydrate to maintain focus and energy.', type='hydration', action_label='Log Water'),
    HealthRecommendation(id='r3', title='Mindfulness', description='Try a 2-minute breathing exercise.', type='mindfulness', action_label='Start Exercise')
]
mock_devices = [
    DeviceStatus(id='d1', name='Apple Watch', type='smartwatch', connected=True, last_sync='2024-06-01T10:00:00Z'),
    DeviceStatus(id='d2', name='Fitbit Charge', type='fitness_tracker', connected=False, last_sync='2024-05-31T22:00:00Z')
]
mock_alerts = [
    'Hydration is below recommended level.',
    'Stress trend detected.'
]

@router.get('/predictions')
def get_predictions():
    return {"success": True, "predictions": [p.dict() for p in mock_predictions]}

@router.get('/recommendations')
def get_recommendations():
    return {"success": True, "recommendations": [r.dict() for r in mock_recommendations]}

@router.get('/devices')
def get_devices():
    return {"success": True, "devices": [d.dict() for d in mock_devices]}

@router.get('/alerts')
def get_alerts():
    return {"success": True, "alerts": mock_alerts} 