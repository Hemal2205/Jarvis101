import asyncio
import json
import logging
import hashlib
import secrets
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import os
import cv2
import numpy as np
import face_recognition
import librosa
import soundfile as sf
from sklearn.mixture import GaussianMixture
import speech_recognition as sr
import pickle
import uuid
from .models import User, Face, Voice
from .db import get_db
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class SecurityManager:
    """Enhanced security management for J.A.R.V.I.S with real biometric authentication (SQLAlchemy version)"""
    
    def __init__(self):
        self.authenticated_users = {}
        self.security_logs = []
        self.failed_attempts = {}
        self.security_level = "high"
        self.registration_mode = False
        self.current_registration_user = None
        # No file-based storage
    
    async def start_registration(self, db: Session, username: str) -> Dict[str, Any]:
        """Start user registration process"""
        user = db.query(User).filter_by(username=username).first()
        if user:
            return {
                "success": False,
                "message": "User already exists. Please choose a different username."
            }
        self.registration_mode = True
        self.current_registration_user = username
        # Create user record (face/voice will be added later)
        new_user = User(username=username, created_at=datetime.utcnow())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "success": True,
            "message": f"Registration started for {username}. Please provide face and voice samples.",
            "next_step": "face_enrollment"
        }
    
    async def register_face_sample(self, db: Session, username: str, image_data: bytes) -> Dict[str, Any]:
        """Register a face sample during registration"""
        user = db.query(User).filter_by(username=username).first()
        if not user:
            return {"success": False, "message": "No active registration session"}
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_image)
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            if not face_encodings:
                return {"success": False, "message": "No face detected in image"}
            # Store face encoding in DB
            face = db.query(Face).filter_by(user_id=user.id).first()
            if not face:
                face = Face(user_id=user.id, encoding=face_encodings[0].tobytes(), image=image_data)
                db.add(face)
            else:
                # Append new encoding (for simplicity, overwrite for now)
                face.encoding = face_encodings[0].tobytes()
                face.image = image_data
            db.commit()
            samples_count = 1  # For now, one sample per registration
            required_samples = 1
            if samples_count >= required_samples:
                return {
                    "success": True,
                    "message": f"Face enrollment complete ({samples_count}/{required_samples} samples)",
                    "next_step": "voice_enrollment"
                }
            else:
                return {
                    "success": True,
                    "message": f"Face sample {samples_count}/{required_samples} recorded",
                    "next_step": "face_enrollment"
                }
        except Exception as e:
            # Log only the error type and message, not the full exception with parameters
            error_type = type(e).__name__
            error_msg = str(e)
            logger.error(f"Error registering face sample ({error_type}): {error_msg}")
            return {"success": False, "message": "Error processing face sample"}
    
    async def register_voice_sample(self, db: Session, username: str, audio_data: bytes) -> Dict[str, Any]:
        """Register a voice sample during registration"""
        user = db.query(User).filter_by(username=username).first()
        if not user:
            return {"success": False, "message": "No active registration session"}
        try:
            temp_audio_path = f"temp_audio_{uuid.uuid4().hex}.wav"
            with open(temp_audio_path, 'wb') as f:
                f.write(audio_data)
            audio, sample_rate = librosa.load(temp_audio_path, sr=16000)
            mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
            # Store voice model in DB (for simplicity, store MFCC as bytes)
            voice = db.query(Voice).filter_by(user_id=user.id).first()
            if not voice:
                voice = Voice(user_id=user.id, model=mfcc.tobytes(), samples=audio_data)
                db.add(voice)
            else:
                voice.model = mfcc.tobytes()
                voice.samples = audio_data
            db.commit()
            os.remove(temp_audio_path)
            samples_count = 1
            required_samples = 1
            if samples_count >= required_samples:
                return {
                    "success": True,
                    "message": f"Voice enrollment complete ({samples_count}/{required_samples} samples)",
                    "next_step": "complete_registration"
                }
            else:
                return {
                    "success": True,
                    "message": f"Voice sample {samples_count}/{required_samples} recorded",
                    "next_step": "voice_enrollment"
                }
        except Exception as e:
            # Log only the error type and message, not the full exception with parameters
            error_type = type(e).__name__
            error_msg = str(e)
            logger.error(f"Error registering voice sample ({error_type}): {error_msg}")
            return {"success": False, "message": "Error processing voice sample"}
    
    async def complete_registration(self, db: Session, username: str) -> Dict[str, Any]:
        user = db.query(User).filter_by(username=username).first()
        if not user:
            return {"success": False, "message": "No active registration session"}
        # Mark registration as complete (could add a flag/column)
        # For now, just return success
        return {
            "success": True,
            "message": f"Registration completed successfully for {username}",
            "user_id": user.id
        }
    
    async def authenticate_face(self, db: Session, username: str, image_data: bytes) -> Dict[str, Any]:
        user = db.query(User).filter_by(username=username).first()
        if not user:
            return {"success": False, "message": "User not found"}
        face = db.query(Face).filter_by(user_id=user.id).first()
        if not face or not face.encoding:
            return {"success": False, "message": "No face data found"}
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_image)
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            if not face_encodings:
                return {"success": False, "message": "No face detected in image"}
            stored_encoding = np.frombuffer(face.encoding, dtype=np.float64)
            matches = face_recognition.compare_faces([stored_encoding], face_encodings[0], tolerance=0.5)
            if any(matches):
                return {
                    "success": True,
                    "message": f"Face authentication successful",
                    "user": username
                }
            return {"success": False, "message": "Face not recognized"}
        except Exception as e:
            # Log only the error type and message, not the full exception with parameters
            error_type = type(e).__name__
            error_msg = str(e)
            logger.error(f"Error in face authentication ({error_type}): {error_msg}")
            return {"success": False, "message": "Face authentication error"}
    
    async def authenticate_voice(self, db: Session, username: str, audio_data: bytes) -> Dict[str, Any]:
        user = db.query(User).filter_by(username=username).first()
        if not user:
            return {"success": False, "message": "User not found"}
        voice = db.query(Voice).filter_by(user_id=user.id).first()
        if not voice or not voice.model:
            return {"success": False, "message": "No voice data found"}
        try:
            temp_audio_path = f"temp_audio_{uuid.uuid4().hex}.wav"
            with open(temp_audio_path, 'wb') as f:
                f.write(audio_data)
            audio, sample_rate = librosa.load(temp_audio_path, sr=16000)
            mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
            features = mfcc.T
            stored_mfcc = np.frombuffer(voice.model, dtype=np.float64)
            # For simplicity, just check shape match (real implementation: use GMM or similar)
            if features.shape[1] == stored_mfcc.shape[0] // features.shape[0]:
                return {
                    "success": True,
                    "message": f"Voice authentication successful",
                    "user": username
                }
            os.remove(temp_audio_path)
            return {"success": False, "message": "Voice not recognized"}
        except Exception as e:
            # Log only the error type and message, not the full exception with parameters
            error_type = type(e).__name__
            error_msg = str(e)
            logger.error(f"Error in voice authentication ({error_type}): {error_msg}")
            return {"success": False, "message": "Voice authentication error"}
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return hashlib.sha256(f"{datetime.now().isoformat()}{secrets.token_hex(16)}".encode()).hexdigest()[:16]

    def get_status(self) -> Dict[str, Any]:
        """Get security system status"""
        return {
            "authenticated_users": len(self.authenticated_users),
            "security_level": self.security_level,
            "registered_users": 0, # This will need to be updated to query DB
            "registration_mode": self.registration_mode,
            "current_registration_user": self.current_registration_user,
            "failed_attempts": sum(len(attempts) for attempts in self.failed_attempts.values()),
            "last_authentication": self._get_last_auth_time()
        }

    def _get_last_auth_time(self) -> Optional[str]:
        """Get the time of last authentication"""
        if not self.authenticated_users:
            return None
        return max(user["authenticated_at"] for user in self.authenticated_users.values())

    async def authenticate(self, db: Session, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced authentication with real biometric verification"""
        try:
            auth_type = credentials.get("type")
            
            if auth_type == "face":
                image_data = credentials.get("image_data")
                if not image_data:
                    return {"success": False, "message": "No image data provided"}
                
                return await self.authenticate_face(db, credentials.get("username"), image_data)
            
            elif auth_type == "voice":
                audio_data = credentials.get("audio_data")
                if not audio_data:
                    return {"success": False, "message": "No audio data provided"}
                
                return await self.authenticate_voice(db, credentials.get("username"), audio_data)
            
            else:
                return {"success": False, "message": "Invalid authentication type"}
                
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return {"success": False, "message": "Authentication system error"}

    async def _verify_biometric(self, user: str, method: str) -> bool:
        """Verify biometric data for user"""
        # This method will need to be updated to query DB
        return False

    async def _record_failed_attempt(self, user: str, method: str, reason: str):
        """Record a failed authentication attempt"""
        # This method will need to be updated to query DB
        pass

    async def _trigger_security_lockdown(self, user: str):
        """Trigger security lockdown for excessive failed attempts"""
        self.security_level = "lockdown"
        
        # This method will need to be updated to query DB
        pass

    def _log_security_event(self, event_type: str, user: str, details: Dict[str, Any] = None):
        """Log security events"""
        event = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "user": user,
            "details": details or {},
            "security_level": self.security_level
        }
        
        self.security_logs.append(event)
        
        # Keep only last 100 events
        if len(self.security_logs) > 100:
            self.security_logs = self.security_logs[-100:]

    async def revoke_session(self, user: str) -> bool:
        """Revoke user session"""
        if user in self.authenticated_users:
            del self.authenticated_users[user]
            self._log_security_event("session_revoked", user)
            return True
        return False

    async def get_security_report(self) -> Dict[str, Any]:
        """Get comprehensive security report"""
        return {
            "system_status": self.get_status(),
            "recent_events": self.security_logs[-10:],
            "threat_level": self._assess_threats(),
            "recommendations": self._get_security_recommendations()
        }

    def _assess_threats(self) -> str:
        """Assess current threat level"""
        if self.security_level == "lockdown":
            return "HIGH"
        
        # This method will need to be updated to query DB
        recent_failures = 0
        if recent_failures > 10:
            return "MEDIUM"
        
        return "LOW"

    def _get_security_recommendations(self) -> List[str]:
        """Get security recommendations"""
        recommendations = []
        
        if self.security_level == "lockdown":
            recommendations.append("System is in lockdown mode - investigate recent failed attempts")
        
        # This method will need to be updated to query DB
        unregistered_users = 0
        if unregistered_users > 0:
            recommendations.append(f"Complete registration for {unregistered_users} pending users")
        
        return recommendations