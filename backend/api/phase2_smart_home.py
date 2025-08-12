from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/smarthome", tags=["smart_home"])

class SmartDevice(BaseModel):
    id: str
    name: str
    type: str
    status: str
    value: Optional[int]
    location: str
    last_updated: str

class SmartAutomation(BaseModel):
    id: str
    name: str
    description: str
    enabled: bool
    schedule: Optional[str]
    devices: List[str]

# Mock data
mock_devices = [
    SmartDevice(id='d1', name='Living Room Light', type='light', status='on', location='Living Room', last_updated='2024-06-01T10:00:00Z'),
    SmartDevice(id='d2', name='Thermostat', type='thermostat', status='active', value=22, location='Hallway', last_updated='2024-06-01T10:01:00Z'),
    SmartDevice(id='d3', name='Front Door Lock', type='lock', status='locked', location='Front Door', last_updated='2024-06-01T10:02:00Z'),
    SmartDevice(id='d4', name='Security Camera', type='camera', status='active', location='Porch', last_updated='2024-06-01T10:03:00Z')
]
mock_automations = [
    SmartAutomation(id='a1', name='Evening Lights', description='Turn on lights at sunset', enabled=True, schedule='Sunset', devices=['d1']),
    SmartAutomation(id='a2', name='Night Lockdown', description='Lock doors at 10pm', enabled=True, schedule='22:00', devices=['d3'])
]
mock_alerts = [
    'Front Door was unlocked at 09:45.',
    'Living Room Light is still on.'
]

@router.get('/devices')
def get_devices():
    return {"success": True, "devices": [d.dict() for d in mock_devices]}

@router.post('/devices/{device_id}/toggle')
def toggle_device(device_id: str):
    for d in mock_devices:
        if d.id == device_id:
            if d.type == 'light':
                d.status = 'off' if d.status == 'on' else 'on'
            elif d.type == 'lock':
                d.status = 'unlocked' if d.status == 'locked' else 'locked'
            d.last_updated = datetime.now().isoformat()
            return {"success": True, "device": d.dict()}
    raise HTTPException(status_code=404, detail='Device not found')

@router.post('/devices/{device_id}/set_temp')
def set_temp(device_id: str, value: int):
    for d in mock_devices:
        if d.id == device_id and d.type == 'thermostat':
            d.value = value
            d.last_updated = datetime.now().isoformat()
            return {"success": True, "device": d.dict()}
    raise HTTPException(status_code=404, detail='Device not found or not a thermostat')

@router.get('/automations')
def get_automations():
    return {"success": True, "automations": [a.dict() for a in mock_automations]}

@router.get('/alerts')
def get_alerts():
    return {"success": True, "alerts": mock_alerts} 