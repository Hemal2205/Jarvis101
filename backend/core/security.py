import asyncio
import json
import logging
import hashlib
import secrets
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

class SecurityManager:
    """Enhanced security management for J.A.R.V.I.S"""
    
    def __init__(self):
        self.authenticated_users = {}
        self.biometric_data = {}
        self.security_logs = []
        self.failed_attempts = {}
        self.security_level = "high"
        self.data_dir = "data/security"
        
        # Ensure directory exists
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize default user
        self._initialize_default_user()
    
    def _initialize_default_user(self):
        """Initialize default user Hemal with mock biometric data"""
        self.biometric_data["Hemal"] = {
            "face_encoding": self._generate_mock_biometric(),
            "voice_signature": self._generate_mock_biometric(),
            "created": datetime.now().isoformat(),
            "last_authenticated": None,
            "authentication_count": 0,
            "security_clearance": "admin"
        }
    
    def _generate_mock_biometric(self) -> str:
        """Generate mock biometric data for demonstration"""
        return hashlib.sha256(secrets.token_bytes(32)).hexdigest()
    
    def get_status(self) -> Dict[str, Any]:
        """Get security system status"""
        return {
            "authenticated_users": len(self.authenticated_users),
            "security_level": self.security_level,
            "biometric_users": len(self.biometric_data),
            "failed_attempts": sum(len(attempts) for attempts in self.failed_attempts.values()),
            "security_events": len(self.security_logs),
            "last_authentication": self._get_last_auth_time()
        }
    
    def _get_last_auth_time(self) -> Optional[str]:
        """Get the last authentication time"""
        if self.authenticated_users:
            return max(user["timestamp"] for user in self.authenticated_users.values())
        return None
    
    async def authenticate(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced biometric authentication"""
        try:
            method = credentials.get("method", "face")
            user = credentials.get("user", "Hemal")
            
            # Log authentication attempt
            self._log_security_event("auth_attempt", user, {"method": method})
            
            # Check if user exists
            if user not in self.biometric_data:
                await self._record_failed_attempt(user, method, "user_not_found")
                return {"success": False, "error": "User not found"}
            
            # Simulate biometric verification
            success = await self._verify_biometric(user, method)
            
            if success:
                # Create session
                session_id = secrets.token_hex(16)
                self.authenticated_users[user] = {
                    "session_id": session_id,
                    "method": method,
                    "timestamp": datetime.now().isoformat(),
                    "ip_address": "127.0.0.1",  # Mock IP
                    "security_clearance": self.biometric_data[user].get("security_clearance", "user")
                }
                
                # Update user data
                self.biometric_data[user]["last_authenticated"] = datetime.now().isoformat()
                self.biometric_data[user]["authentication_count"] += 1
                
                # Clear failed attempts
                if user in self.failed_attempts:
                    del self.failed_attempts[user]
                
                self._log_security_event("auth_success", user, {"method": method, "session_id": session_id})
                
                return {
                    "success": True,
                    "user": user,
                    "session_id": session_id,
                    "security_clearance": self.biometric_data[user].get("security_clearance", "user")
                }
            else:
                await self._record_failed_attempt(user, method, "biometric_mismatch")
                return {"success": False, "error": "Biometric verification failed"}
                
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return {"success": False, "error": "Authentication system error"}
    
    async def _verify_biometric(self, user: str, method: str) -> bool:
        """Simulate biometric verification"""
        # Simulate processing time
        await asyncio.sleep(0.5)
        
        # Mock verification (always succeeds for demo)
        # In production, this would use actual biometric comparison
        return True
    
    async def _record_failed_attempt(self, user: str, method: str, reason: str):
        """Record failed authentication attempt"""
        if user not in self.failed_attempts:
            self.failed_attempts[user] = []
        
        attempt = {
            "method": method,
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
            "ip_address": "127.0.0.1"
        }
        
        self.failed_attempts[user].append(attempt)
        
        # Log security event
        self._log_security_event("auth_failure", user, attempt)
        
        # Check for security threats
        if len(self.failed_attempts[user]) >= 5:
            await self._trigger_security_lockdown(user)
    
    async def _trigger_security_lockdown(self, user: str):
        """Trigger security lockdown for suspicious activity"""
        logger.warning(f"Security lockdown triggered for user: {user}")
        
        # Remove from authenticated users
        if user in self.authenticated_users:
            del self.authenticated_users[user]
        
        # Log security event
        self._log_security_event("security_lockdown", user, {
            "failed_attempts": len(self.failed_attempts.get(user, [])),
            "lockdown_time": datetime.now().isoformat()
        })
        
        # Increase security level
        self.security_level = "critical"
    
    def _log_security_event(self, event_type: str, user: str, details: Dict[str, Any] = None):
        """Log security events"""
        event = {
            "id": str(len(self.security_logs) + 1),
            "type": event_type,
            "user": user,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        
        self.security_logs.append(event)
        
        # Keep only last 1000 events
        if len(self.security_logs) > 1000:
            self.security_logs = self.security_logs[-1000:]
    
    async def revoke_session(self, user: str) -> bool:
        """Revoke user session"""
        if user in self.authenticated_users:
            session_id = self.authenticated_users[user]["session_id"]
            del self.authenticated_users[user]
            
            self._log_security_event("session_revoked", user, {"session_id": session_id})
            return True
        return False
    
    async def get_security_report(self) -> Dict[str, Any]:
        """Generate comprehensive security report"""
        return {
            "security_level": self.security_level,
            "active_sessions": len(self.authenticated_users),
            "total_users": len(self.biometric_data),
            "recent_events": self.security_logs[-10:],  # Last 10 events
            "threat_assessment": self._assess_threats(),
            "recommendations": self._get_security_recommendations()
        }
    
    def _assess_threats(self) -> str:
        """Assess current threat level"""
        total_failed = sum(len(attempts) for attempts in self.failed_attempts.values())
        
        if total_failed > 20:
            return "high"
        elif total_failed > 10:
            return "medium"
        else:
            return "low"
    
    def _get_security_recommendations(self) -> List[str]:
        """Get security recommendations"""
        recommendations = []
        
        if self.security_level == "critical":
            recommendations.append("Consider implementing additional security measures")
        
        if len(self.failed_attempts) > 0:
            recommendations.append("Monitor failed authentication attempts")
        
        if len(self.authenticated_users) == 0:
            recommendations.append("No active sessions - system secure")
        
        return recommendations