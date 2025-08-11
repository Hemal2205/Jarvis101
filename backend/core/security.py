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

logger = logging.getLogger(__name__)

class SecurityManager:
    """Enhanced security management for J.A.R.V.I.S with real biometric authentication"""
    
    def __init__(self):
        self.authenticated_users = {}
        self.biometric_data = {}
        self.security_logs = []
        self.failed_attempts = {}
        self.security_level = "high"
        self.data_dir = "data/security"
        self.face_encodings_file = "data/security/face_encodings.pkl"
        self.voice_models_file = "data/security/voice_models.pkl"
        self.users_db_file = "data/security/users.json"
        self.registration_mode = False
        self.current_registration_user = None
        
        # Ensure directory exists
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize users database
        self._load_users_database()
        
        # Initialize face recognition
        self.face_encodings = {}
        self.voice_models = {}
        self._load_biometric_models()
        
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
    
    def _load_users_database(self):
        """Load users database from file"""
        try:
            if os.path.exists(self.users_db_file):
                with open(self.users_db_file, 'r') as f:
                    self.biometric_data = json.load(f)
            else:
                self.biometric_data = {}
        except Exception as e:
            logger.error(f"Error loading users database: {e}")
            self.biometric_data = {}
    
    def _save_users_database(self):
        """Save users database to file"""
        try:
            with open(self.users_db_file, 'w') as f:
                json.dump(self.biometric_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving users database: {e}")
    
    def _load_biometric_models(self):
        """Load face encodings and voice models"""
        try:
            if os.path.exists(self.face_encodings_file):
                with open(self.face_encodings_file, 'rb') as f:
                    self.face_encodings = pickle.load(f)
            
            if os.path.exists(self.voice_models_file):
                with open(self.voice_models_file, 'rb') as f:
                    self.voice_models = pickle.load(f)
        except Exception as e:
            logger.error(f"Error loading biometric models: {e}")
            self.face_encodings = {}
            self.voice_models = {}
    
    def _save_biometric_models(self):
        """Save face encodings and voice models"""
        try:
            with open(self.face_encodings_file, 'wb') as f:
                pickle.dump(self.face_encodings, f)
            
            with open(self.voice_models_file, 'wb') as f:
                pickle.dump(self.voice_models, f)
        except Exception as e:
            logger.error(f"Error saving biometric models: {e}")
    
    async def start_registration(self, username: str) -> Dict[str, Any]:
        """Start user registration process"""
        if username in self.biometric_data:
            return {
                "success": False,
                "message": "User already exists. Please choose a different username."
            }
        
        self.registration_mode = True
        self.current_registration_user = username
        
        # Initialize user data
        self.biometric_data[username] = {
            "created": datetime.now().isoformat(),
            "face_samples": [],
            "voice_samples": [],
            "registration_complete": False,
            "security_clearance": "user",
            "last_authenticated": None,
            "authentication_count": 0
        }
        
        return {
            "success": True,
            "message": f"Registration started for {username}. Please provide face and voice samples.",
            "next_step": "face_enrollment"
        }
    
    async def register_face_sample(self, image_data: bytes) -> Dict[str, Any]:
        """Register a face sample during registration"""
        if not self.registration_mode or not self.current_registration_user:
            return {"success": False, "message": "No active registration session"}
        
        try:
            # Convert image data to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Find face encodings
            face_locations = face_recognition.face_locations(rgb_image)
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            if not face_encodings:
                return {"success": False, "message": "No face detected in image"}
            
            # Store face encoding
            username = self.current_registration_user
            if username not in self.face_encodings:
                self.face_encodings[username] = []
            
            self.face_encodings[username].append(face_encodings[0])
            
            # Update user data
            self.biometric_data[username]["face_samples"].append(len(self.face_encodings[username]))
            
            samples_count = len(self.face_encodings[username])
            required_samples = 3
            
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
            logger.error(f"Error registering face sample: {e}")
            return {"success": False, "message": "Error processing face sample"}
    
    async def register_voice_sample(self, audio_data: bytes) -> Dict[str, Any]:
        """Register a voice sample during registration"""
        if not self.registration_mode or not self.current_registration_user:
            return {"success": False, "message": "No active registration session"}
        
        try:
            # Save audio data temporarily
            temp_audio_path = f"temp_audio_{uuid.uuid4().hex}.wav"
            with open(temp_audio_path, 'wb') as f:
                f.write(audio_data)
            
            # Load audio and extract features
            audio, sample_rate = librosa.load(temp_audio_path, sr=16000)
            
            # Extract MFCC features
            mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
            
            # Store voice features
            username = self.current_registration_user
            if username not in self.voice_models:
                self.voice_models[username] = {"features": []}
            
            self.voice_models[username]["features"].append(mfcc)
            
            # Update user data
            self.biometric_data[username]["voice_samples"].append(len(self.voice_models[username]["features"]))
            
            samples_count = len(self.voice_models[username]["features"])
            required_samples = 3
            
            # Clean up temporary file
            os.remove(temp_audio_path)
            
            if samples_count >= required_samples:
                # Train voice model
                await self._train_voice_model(username)
                
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
            logger.error(f"Error registering voice sample: {e}")
            return {"success": False, "message": "Error processing voice sample"}
    
    async def complete_registration(self) -> Dict[str, Any]:
        """Complete user registration process"""
        if not self.registration_mode or not self.current_registration_user:
            return {"success": False, "message": "No active registration session"}
        
        username = self.current_registration_user
        
        # Check if both face and voice samples are available
        face_samples = len(self.face_encodings.get(username, []))
        voice_samples = len(self.voice_models.get(username, {}).get("features", []))
        
        if face_samples < 3 or voice_samples < 3:
            return {
                "success": False,
                "message": f"Insufficient samples. Face: {face_samples}/3, Voice: {voice_samples}/3"
            }
        
        # Mark registration as complete
        self.biometric_data[username]["registration_complete"] = True
        
        # Save all data
        self._save_users_database()
        self._save_biometric_models()
        
        # Reset registration mode
        self.registration_mode = False
        self.current_registration_user = None
        
        return {
            "success": True,
            "message": f"Registration completed successfully for {username}",
            "user_id": username
        }
    
    async def _train_voice_model(self, username: str):
        """Train voice recognition model for user"""
        try:
            features = self.voice_models[username]["features"]
            
            # Combine all features
            all_features = np.concatenate([f.T for f in features], axis=0)
            
            # Train Gaussian Mixture Model
            gmm = GaussianMixture(n_components=16, covariance_type='diag')
            gmm.fit(all_features)
            
            # Store trained model
            self.voice_models[username]["model"] = gmm
            
        except Exception as e:
            logger.error(f"Error training voice model for {username}: {e}")
    
    async def authenticate_face(self, image_data: bytes) -> Dict[str, Any]:
        """Authenticate user using face recognition"""
        try:
            # Convert image data to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Find face encodings
            face_locations = face_recognition.face_locations(rgb_image)
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            if not face_encodings:
                return {"success": False, "message": "No face detected"}
            
            current_encoding = face_encodings[0]
            
            # Compare with stored encodings
            for username, stored_encodings in self.face_encodings.items():
                if not self.biometric_data[username]["registration_complete"]:
                    continue
                
                # Compare with all stored encodings for this user
                matches = face_recognition.compare_faces(stored_encodings, current_encoding, tolerance=0.6)
                
                if any(matches):
                    # Authentication successful
                    self.authenticated_users[username] = {
                        "authenticated_at": datetime.now().isoformat(),
                        "method": "face",
                        "session_id": self._generate_session_id()
                    }
                    
                    # Update user data
                    self.biometric_data[username]["last_authenticated"] = datetime.now().isoformat()
                    self.biometric_data[username]["authentication_count"] += 1
                    
                    self._save_users_database()
                    
                    return {
                        "success": True,
                        "message": f"Face authentication successful",
                        "user": username,
                        "session_id": self.authenticated_users[username]["session_id"]
                    }
            
            # No match found
            await self._record_failed_attempt("unknown", "face", "face_not_recognized")
            return {"success": False, "message": "Face not recognized"}
            
        except Exception as e:
            logger.error(f"Error in face authentication: {e}")
            return {"success": False, "message": "Face authentication error"}
    
    async def authenticate_voice(self, audio_data: bytes) -> Dict[str, Any]:
        """Authenticate user using voice recognition"""
        try:
            # Save audio data temporarily
            temp_audio_path = f"temp_audio_{uuid.uuid4().hex}.wav"
            with open(temp_audio_path, 'wb') as f:
                f.write(audio_data)
            
            # Load audio and extract features
            audio, sample_rate = librosa.load(temp_audio_path, sr=16000)
            
            # Extract MFCC features
            mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=13)
            features = mfcc.T
            
            # Compare with stored voice models
            best_score = -float('inf')
            best_user = None
            
            for username, voice_data in self.voice_models.items():
                if not self.biometric_data[username]["registration_complete"]:
                    continue
                
                if "model" not in voice_data:
                    continue
                
                try:
                    # Calculate likelihood
                    score = voice_data["model"].score(features)
                    
                    if score > best_score:
                        best_score = score
                        best_user = username
                        
                except Exception as e:
                    logger.error(f"Error scoring voice for {username}: {e}")
                    continue
            
            # Clean up temporary file
            os.remove(temp_audio_path)
            
            # Check if score is above threshold
            threshold = -50  # Adjust based on testing
            
            if best_user and best_score > threshold:
                # Authentication successful
                self.authenticated_users[best_user] = {
                    "authenticated_at": datetime.now().isoformat(),
                    "method": "voice",
                    "session_id": self._generate_session_id()
                }
                
                # Update user data
                self.biometric_data[best_user]["last_authenticated"] = datetime.now().isoformat()
                self.biometric_data[best_user]["authentication_count"] += 1
                
                self._save_users_database()
                
                return {
                    "success": True,
                    "message": f"Voice authentication successful",
                    "user": best_user,
                    "session_id": self.authenticated_users[best_user]["session_id"]
                }
            
            # No match found
            await self._record_failed_attempt("unknown", "voice", "voice_not_recognized")
            return {"success": False, "message": "Voice not recognized"}
            
        except Exception as e:
            logger.error(f"Error in voice authentication: {e}")
            return {"success": False, "message": "Voice authentication error"}
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return hashlib.sha256(f"{datetime.now().isoformat()}{secrets.token_hex(16)}".encode()).hexdigest()[:16]

    def get_status(self) -> Dict[str, Any]:
        """Get security system status"""
        return {
            "authenticated_users": len(self.authenticated_users),
            "security_level": self.security_level,
            "registered_users": len([u for u in self.biometric_data.values() if u.get("registration_complete", False)]),
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

    async def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced authentication with real biometric verification"""
        try:
            auth_type = credentials.get("type")
            
            if auth_type == "face":
                image_data = credentials.get("image_data")
                if not image_data:
                    return {"success": False, "message": "No image data provided"}
                
                return await self.authenticate_face(image_data)
            
            elif auth_type == "voice":
                audio_data = credentials.get("audio_data")
                if not audio_data:
                    return {"success": False, "message": "No audio data provided"}
                
                return await self.authenticate_voice(audio_data)
            
            else:
                return {"success": False, "message": "Invalid authentication type"}
                
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return {"success": False, "message": "Authentication system error"}

    async def _verify_biometric(self, user: str, method: str) -> bool:
        """Verify biometric data for user"""
        if user not in self.biometric_data:
            return False
        
        user_data = self.biometric_data[user]
        
        if method == "face":
            return len(user_data.get("face_samples", [])) >= 3
        elif method == "voice":
            return len(user_data.get("voice_samples", [])) >= 3
        
        return False

    async def _record_failed_attempt(self, user: str, method: str, reason: str):
        """Record a failed authentication attempt"""
        if user not in self.failed_attempts:
            self.failed_attempts[user] = []
        
        self.failed_attempts[user].append({
            "timestamp": datetime.now().isoformat(),
            "method": method,
            "reason": reason,
            "ip_address": "127.0.0.1"  # Could be enhanced to get real IP
        })
        
        # Keep only last 10 failed attempts per user
        if len(self.failed_attempts[user]) > 10:
            self.failed_attempts[user] = self.failed_attempts[user][-10:]
        
        # Log security event
        self._log_security_event("failed_auth", user, {
            "method": method,
            "reason": reason,
            "attempts_count": len(self.failed_attempts[user])
        })
        
        # Trigger security lockdown if too many attempts
        if len(self.failed_attempts[user]) >= 5:
            await self._trigger_security_lockdown(user)

    async def _trigger_security_lockdown(self, user: str):
        """Trigger security lockdown for excessive failed attempts"""
        self.security_level = "lockdown"
        
        self._log_security_event("security_lockdown", user, {
            "reason": "excessive_failed_attempts",
            "failed_attempts": len(self.failed_attempts.get(user, []))
        })
        
        # Clear failed attempts after lockdown
        if user in self.failed_attempts:
            del self.failed_attempts[user]
        
        # Auto-reset after 5 minutes
        await asyncio.sleep(300)
        self.security_level = "high"
        
        self._log_security_event("security_lockdown_reset", user, {
            "reason": "timeout"
        })

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
        
        recent_failures = sum(len(attempts) for attempts in self.failed_attempts.values())
        if recent_failures > 10:
            return "MEDIUM"
        
        return "LOW"

    def _get_security_recommendations(self) -> List[str]:
        """Get security recommendations"""
        recommendations = []
        
        if self.security_level == "lockdown":
            recommendations.append("System is in lockdown mode - investigate recent failed attempts")
        
        unregistered_users = len([u for u in self.biometric_data.values() if not u.get("registration_complete", False)])
        if unregistered_users > 0:
            recommendations.append(f"Complete registration for {unregistered_users} pending users")
        
        return recommendations