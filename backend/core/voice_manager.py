import asyncio
import os
import logging
from typing import Dict, List, Any, Optional
import pyttsx3
import pygame
from io import BytesIO
import json
import uuid
from datetime import datetime
import threading
import queue
import wave
import tempfile

logger = logging.getLogger(__name__)

class VoiceManager:
    """Advanced voice synthesis and management system for J.A.R.V.I.S"""
    
    def __init__(self):
        self.voice_profiles = {
            "jarvis_default": {
                "name": "J.A.R.V.I.S Default",
                "description": "Classic J.A.R.V.I.S voice with British accent",
                "voice_id": "english+m1",
                "rate": 180,
                "volume": 0.8,
                "pitch": 0.0,
                "personality": "professional"
            },
            "jarvis_cinematic": {
                "name": "J.A.R.V.I.S Cinematic",
                "description": "Cinematic J.A.R.V.I.S voice from Iron Man movies",
                "voice_id": "english+m2",
                "rate": 170,
                "volume": 0.9,
                "pitch": -0.1,
                "personality": "witty"
            },
            "jarvis_urgent": {
                "name": "J.A.R.V.I.S Urgent",
                "description": "Urgent notification voice",
                "voice_id": "english+m1",
                "rate": 200,
                "volume": 1.0,
                "pitch": 0.1,
                "personality": "urgent"
            },
            "jarvis_calm": {
                "name": "J.A.R.V.I.S Calm",
                "description": "Calm and soothing voice",
                "voice_id": "english+m3",
                "rate": 160,
                "volume": 0.7,
                "pitch": -0.2,
                "personality": "calm"
            }
        }
        
        self.current_profile = "jarvis_cinematic"
        self.speech_queue = queue.Queue()
        self.is_speaking = False
        self.voice_engine = None
        self.audio_effects = {
            "echo": False,
            "reverb": True,
            "bass_boost": True,
            "spatial_audio": True
        }
        
        # Initialize components
        self._initialize_voice_engine()
        self._initialize_audio_system()
        
        # Voice response templates
        self.response_templates = {
            "greeting": [
                "Good {time_of_day}, {user_name}. J.A.R.V.I.S. online.",
                "Welcome back, {user_name}. All systems operational.",
                "J.A.R.V.I.S. at your service, {user_name}.",
                "Good to see you again, {user_name}. How may I assist you?"
            ],
            "authentication": [
                "Authentication successful. Welcome, {user_name}.",
                "Voice pattern recognized. Access granted.",
                "Biometric authentication complete. Hello, {user_name}.",
                "Identity confirmed. J.A.R.V.I.S. is ready to assist."
            ],
            "learning": [
                "Initiating learning protocol for {topic}.",
                "Acquiring knowledge on {topic}. This may take a moment.",
                "Learning module activated. Subject: {topic}.",
                "Expanding knowledge base with {topic} information."
            ],
            "skill_mastery": [
                "Skill mastery achieved in {skill_name}. Well done.",
                "Congratulations, {user_name}. {skill_name} has been mastered.",
                "Skill level upgraded to {level} in {skill_name}.",
                "Knowledge acquisition complete for {skill_name}."
            ],
            "system_status": [
                "All systems functioning at optimal capacity.",
                "System diagnostics complete. No issues detected.",
                "J.A.R.V.I.S. operating at peak performance.",
                "All modules online and responsive."
            ],
            "close_warning": [
                "Warning: Learning session in progress. Are you sure you want to exit?",
                "Active learning protocols will be interrupted. Confirm shutdown?",
                "I'm currently acquiring new knowledge. Shall I pause and shutdown?",
                "Learning in progress. Would you like me to save current progress and exit?"
            ],
            "shutdown": [
                "J.A.R.V.I.S. shutting down. Goodbye, {user_name}.",
                "Until next time, {user_name}. J.A.R.V.I.S. offline.",
                "Powering down. See you soon, {user_name}.",
                "J.A.R.V.I.S. signing off. Have a great day, {user_name}."
            ]
        }
        
        # Cinematic sound effects
        self.sound_effects = {
            "startup": "sounds/jarvis_startup.wav",
            "notification": "sounds/jarvis_notification.wav",
            "alert": "sounds/jarvis_alert.wav",
            "success": "sounds/jarvis_success.wav",
            "error": "sounds/jarvis_error.wav",
            "processing": "sounds/jarvis_processing.wav"
        }
        
        # Start voice processing thread
        self.voice_thread = threading.Thread(target=self._voice_processing_loop, daemon=True)
        self.voice_thread.start()
    
    def _initialize_voice_engine(self):
        """Initialize the text-to-speech engine"""
        try:
            self.voice_engine = pyttsx3.init()
            
            # Set voice properties
            voices = self.voice_engine.getProperty('voices')
            if voices:
                # Try to find a male voice
                for voice in voices:
                    if 'male' in voice.name.lower() or 'david' in voice.name.lower():
                        self.voice_engine.setProperty('voice', voice.id)
                        break
                else:
                    # Use first available voice
                    self.voice_engine.setProperty('voice', voices[0].id)
            
            # Apply current profile settings
            self._apply_voice_profile(self.current_profile)
            
            logger.info("Voice engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing voice engine: {e}")
            self.voice_engine = None
    
    def _initialize_audio_system(self):
        """Initialize pygame for audio playback"""
        try:
            pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
            logger.info("Audio system initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing audio system: {e}")
    
    def _apply_voice_profile(self, profile_name: str):
        """Apply voice profile settings"""
        if profile_name not in self.voice_profiles:
            logger.warning(f"Voice profile '{profile_name}' not found")
            return
        
        profile = self.voice_profiles[profile_name]
        
        if self.voice_engine:
            try:
                self.voice_engine.setProperty('rate', profile['rate'])
                self.voice_engine.setProperty('volume', profile['volume'])
                
                # Note: Pitch adjustment would require additional audio processing
                # For now, we'll use rate and volume adjustments
                
            except Exception as e:
                logger.error(f"Error applying voice profile: {e}")
    
    def _voice_processing_loop(self):
        """Main voice processing loop running in background thread"""
        while True:
            try:
                # Get next speech item from queue
                speech_item = self.speech_queue.get(timeout=1)
                
                if speech_item is None:  # Shutdown signal
                    break
                
                # Process speech
                self._process_speech_item(speech_item)
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error in voice processing loop: {e}")
    
    def _process_speech_item(self, speech_item: Dict[str, Any]):
        """Process a single speech item"""
        try:
            text = speech_item.get('text', '')
            profile = speech_item.get('profile', self.current_profile)
            priority = speech_item.get('priority', 'normal')
            effects = speech_item.get('effects', True)
            
            # Apply profile if different from current
            if profile != self.current_profile:
                self._apply_voice_profile(profile)
            
            # Set speaking flag
            self.is_speaking = True
            
            # Play pre-speech sound effect if enabled
            if effects and 'pre_sound' in speech_item:
                self._play_sound_effect(speech_item['pre_sound'])
            
            # Speak the text
            if self.voice_engine:
                self.voice_engine.say(text)
                self.voice_engine.runAndWait()
            
            # Play post-speech sound effect if enabled
            if effects and 'post_sound' in speech_item:
                self._play_sound_effect(speech_item['post_sound'])
            
            # Clear speaking flag
            self.is_speaking = False
            
        except Exception as e:
            logger.error(f"Error processing speech item: {e}")
            self.is_speaking = False
    
    def _play_sound_effect(self, effect_name: str):
        """Play a sound effect"""
        try:
            if effect_name in self.sound_effects:
                sound_file = self.sound_effects[effect_name]
                if os.path.exists(sound_file):
                    sound = pygame.mixer.Sound(sound_file)
                    sound.play()
                    
                    # Wait for sound to finish
                    while pygame.mixer.get_busy():
                        pygame.time.wait(10)
                        
        except Exception as e:
            logger.error(f"Error playing sound effect '{effect_name}': {e}")
    
    async def speak(self, text: str, profile: str = None, priority: str = 'normal', effects: bool = True) -> Dict[str, Any]:
        """Add text to speech queue"""
        try:
            speech_item = {
                'id': str(uuid.uuid4()),
                'text': text,
                'profile': profile or self.current_profile,
                'priority': priority,
                'effects': effects,
                'timestamp': datetime.now().isoformat()
            }
            
            # Add sound effects for cinematic experience
            if effects:
                if priority == 'urgent':
                    speech_item['pre_sound'] = 'alert'
                elif priority == 'success':
                    speech_item['pre_sound'] = 'success'
                elif priority == 'error':
                    speech_item['pre_sound'] = 'error'
                else:
                    speech_item['pre_sound'] = 'notification'
            
            # Add to queue
            self.speech_queue.put(speech_item)
            
            return {
                "success": True,
                "speech_id": speech_item['id'],
                "message": "Speech queued successfully"
            }
            
        except Exception as e:
            logger.error(f"Error queuing speech: {e}")
            return {
                "success": False,
                "message": f"Failed to queue speech: {str(e)}"
            }
    
    async def speak_template(self, template_category: str, template_params: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """Speak using a predefined template"""
        try:
            if template_category not in self.response_templates:
                return {
                    "success": False,
                    "message": f"Template category '{template_category}' not found"
                }
            
            templates = self.response_templates[template_category]
            
            # Select template (can be random or based on context)
            import random
            template = random.choice(templates)
            
            # Apply parameters
            params = template_params or {}
            
            # Add default parameters
            params.setdefault('user_name', 'User')
            params.setdefault('time_of_day', self._get_time_of_day())
            
            # Format template
            try:
                formatted_text = template.format(**params)
            except KeyError as e:
                logger.warning(f"Missing template parameter: {e}")
                formatted_text = template
            
            # Speak the formatted text
            return await self.speak(formatted_text, **kwargs)
            
        except Exception as e:
            logger.error(f"Error speaking template: {e}")
            return {
                "success": False,
                "message": f"Failed to speak template: {str(e)}"
            }
    
    def _get_time_of_day(self) -> str:
        """Get appropriate time of day greeting"""
        hour = datetime.now().hour
        
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"
    
    async def set_voice_profile(self, profile_name: str) -> Dict[str, Any]:
        """Set the current voice profile"""
        try:
            if profile_name not in self.voice_profiles:
                return {
                    "success": False,
                    "message": f"Voice profile '{profile_name}' not found"
                }
            
            self.current_profile = profile_name
            self._apply_voice_profile(profile_name)
            
            return {
                "success": True,
                "message": f"Voice profile set to '{profile_name}'",
                "profile": self.voice_profiles[profile_name]
            }
            
        except Exception as e:
            logger.error(f"Error setting voice profile: {e}")
            return {
                "success": False,
                "message": f"Failed to set voice profile: {str(e)}"
            }
    
    async def get_voice_profiles(self) -> Dict[str, Any]:
        """Get all available voice profiles"""
        return {
            "profiles": self.voice_profiles,
            "current_profile": self.current_profile
        }
    
    async def configure_audio_effects(self, effects: Dict[str, bool]) -> Dict[str, Any]:
        """Configure audio effects"""
        try:
            self.audio_effects.update(effects)
            
            return {
                "success": True,
                "message": "Audio effects configured",
                "effects": self.audio_effects
            }
            
        except Exception as e:
            logger.error(f"Error configuring audio effects: {e}")
            return {
                "success": False,
                "message": f"Failed to configure audio effects: {str(e)}"
            }
    
    async def interrupt_speech(self) -> Dict[str, Any]:
        """Interrupt current speech"""
        try:
            if self.voice_engine and self.is_speaking:
                self.voice_engine.stop()
            
            # Clear speech queue
            while not self.speech_queue.empty():
                try:
                    self.speech_queue.get_nowait()
                except queue.Empty:
                    break
            
            self.is_speaking = False
            
            return {
                "success": True,
                "message": "Speech interrupted"
            }
            
        except Exception as e:
            logger.error(f"Error interrupting speech: {e}")
            return {
                "success": False,
                "message": f"Failed to interrupt speech: {str(e)}"
            }
    
    async def get_speech_status(self) -> Dict[str, Any]:
        """Get current speech status"""
        return {
            "is_speaking": self.is_speaking,
            "queue_size": self.speech_queue.qsize(),
            "current_profile": self.current_profile,
            "audio_effects": self.audio_effects
        }
    
    async def create_custom_voice_profile(self, name: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Create a custom voice profile"""
        try:
            if name in self.voice_profiles:
                return {
                    "success": False,
                    "message": f"Voice profile '{name}' already exists"
                }
            
            # Validate settings
            required_fields = ['rate', 'volume', 'pitch', 'personality']
            for field in required_fields:
                if field not in settings:
                    return {
                        "success": False,
                        "message": f"Missing required field: {field}"
                    }
            
            # Create new profile
            self.voice_profiles[name] = {
                "name": settings.get('display_name', name),
                "description": settings.get('description', f"Custom voice profile: {name}"),
                "voice_id": settings.get('voice_id', 'english+m1'),
                "rate": settings['rate'],
                "volume": settings['volume'],
                "pitch": settings['pitch'],
                "personality": settings['personality']
            }
            
            return {
                "success": True,
                "message": f"Custom voice profile '{name}' created",
                "profile": self.voice_profiles[name]
            }
            
        except Exception as e:
            logger.error(f"Error creating custom voice profile: {e}")
            return {
                "success": False,
                "message": f"Failed to create custom voice profile: {str(e)}"
            }
    
    async def play_startup_sound(self):
        """Play JARVIS startup sound"""
        try:
            self._play_sound_effect('startup')
            
            # Welcome message
            await self.speak_template('greeting', {
                'user_name': 'User',
                'time_of_day': self._get_time_of_day()
            })
            
        except Exception as e:
            logger.error(f"Error playing startup sound: {e}")
    
    async def notify_learning_interruption(self, skill_name: str) -> Dict[str, Any]:
        """Notify user about learning interruption"""
        try:
            await self.speak_template('close_warning', {
                'skill_name': skill_name
            }, priority='urgent')
            
            return {
                "success": True,
                "message": "Learning interruption notification sent"
            }
            
        except Exception as e:
            logger.error(f"Error notifying learning interruption: {e}")
            return {
                "success": False,
                "message": f"Failed to notify learning interruption: {str(e)}"
            }
    
    async def celebrate_skill_mastery(self, skill_name: str, level: str, user_name: str = "User") -> Dict[str, Any]:
        """Celebrate skill mastery achievement"""
        try:
            self._play_sound_effect('success')
            
            await self.speak_template('skill_mastery', {
                'skill_name': skill_name,
                'level': level,
                'user_name': user_name
            }, priority='success')
            
            return {
                "success": True,
                "message": "Skill mastery celebration sent"
            }
            
        except Exception as e:
            logger.error(f"Error celebrating skill mastery: {e}")
            return {
                "success": False,
                "message": f"Failed to celebrate skill mastery: {str(e)}"
            }
    
    def get_status(self) -> Dict[str, Any]:
        """Get voice manager status"""
        return {
            "is_speaking": self.is_speaking,
            "current_profile": self.current_profile,
            "available_profiles": len(self.voice_profiles),
            "queue_size": self.speech_queue.qsize(),
            "audio_effects": self.audio_effects,
            "voice_engine_available": self.voice_engine is not None
        }
    
    async def shutdown(self):
        """Shutdown the voice manager"""
        try:
            # Play shutdown sound
            await self.speak_template('shutdown', {
                'user_name': 'User'
            })
            
            # Wait for speech to complete
            while self.is_speaking:
                await asyncio.sleep(0.1)
            
            # Stop voice processing thread
            self.speech_queue.put(None)
            
            # Cleanup
            if self.voice_engine:
                self.voice_engine.stop()
            
            pygame.mixer.quit()
            
            logger.info("Voice manager shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during voice manager shutdown: {e}")