"""
Real-time Monitoring System for J.A.R.V.I.S
Provides live system status, performance metrics, and proactive notifications
"""

import asyncio
import json
import logging
import psutil
import time
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
import threading
from collections import defaultdict
import pygetwindow as gw
import pyautogui

logger = logging.getLogger(__name__)

class RealtimeMonitor:
    """Real-time system monitoring with proactive notifications"""
    
    def __init__(self):
        self.monitoring_active = False
        self.monitor_thread = None
        self.callbacks = defaultdict(list)
        self.metrics_history = []
        self.alert_thresholds = {
            "cpu_usage": 80.0,
            "memory_usage": 85.0,
            "disk_usage": 90.0,
            "network_latency": 100.0
        }
        self.system_status = {
            "cpu": {"usage": 0, "temperature": 0, "cores": 0},
            "memory": {"usage": 0, "available": 0, "total": 0},
            "disk": {"usage": 0, "free": 0, "total": 0},
            "network": {"latency": 0, "bandwidth": 0},
            "applications": [],
            "active_window": None,
            "last_update": None
        }
        self.performance_alerts = []
        self.user_activity = {
            "last_mouse_move": None,
            "last_keyboard_input": None,
            "active_applications": set(),
            "session_duration": 0
        }
        
    def start_monitoring(self):
        """Start real-time monitoring"""
        if not self.monitoring_active:
            self.monitoring_active = True
            self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
            self.monitor_thread.start()
            logger.info("Real-time monitoring started")
            
    def stop_monitoring(self):
        """Stop real-time monitoring"""
        self.monitoring_active = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=1)
        logger.info("Real-time monitoring stopped")
        
    def add_callback(self, event_type: str, callback: Callable):
        """Add callback for specific event types"""
        self.callbacks[event_type].append(callback)
        
    def remove_callback(self, event_type: str, callback: Callable):
        """Remove callback for specific event types"""
        if event_type in self.callbacks and callback in self.callbacks[event_type]:
            self.callbacks[event_type].remove(callback)
            
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.monitoring_active:
            try:
                # Collect system metrics
                self._collect_system_metrics()
                
                # Check for performance alerts
                self._check_performance_alerts()
                
                # Monitor user activity
                self._monitor_user_activity()
                
                # Monitor application changes
                self._monitor_applications()
                
                # Store metrics history (keep last 100 entries)
                self._store_metrics()
                
                # Trigger callbacks
                self._trigger_callbacks()
                
                time.sleep(1)  # Update every second
                
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
                time.sleep(5)  # Wait longer on error
                
    def _collect_system_metrics(self):
        """Collect current system metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            cpu_count = psutil.cpu_count()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            
            # Network metrics (simplified)
            network_latency = self._measure_network_latency()
            
            # Update system status
            self.system_status.update({
                "cpu": {
                    "usage": cpu_percent,
                    "cores": cpu_count,
                    "temperature": self._get_cpu_temperature()
                },
                "memory": {
                    "usage": memory.percent,
                    "available": memory.available // (1024**3),  # GB
                    "total": memory.total // (1024**3)  # GB
                },
                "disk": {
                    "usage": disk.percent,
                    "free": disk.free // (1024**3),  # GB
                    "total": disk.total // (1024**3)  # GB
                },
                "network": {
                    "latency": network_latency,
                    "bandwidth": self._get_network_bandwidth()
                },
                "last_update": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            
    def _check_performance_alerts(self):
        """Check for performance threshold violations"""
        alerts = []
        
        # CPU alert
        if self.system_status["cpu"]["usage"] > self.alert_thresholds["cpu_usage"]:
            alerts.append({
                "type": "cpu_high",
                "severity": "warning",
                "message": f"CPU usage is high: {self.system_status['cpu']['usage']:.1f}%",
                "timestamp": datetime.now().isoformat(),
                "value": self.system_status["cpu"]["usage"]
            })
            
        # Memory alert
        if self.system_status["memory"]["usage"] > self.alert_thresholds["memory_usage"]:
            alerts.append({
                "type": "memory_high",
                "severity": "warning",
                "message": f"Memory usage is high: {self.system_status['memory']['usage']:.1f}%",
                "timestamp": datetime.now().isoformat(),
                "value": self.system_status["memory"]["usage"]
            })
            
        # Disk alert
        if self.system_status["disk"]["usage"] > self.alert_thresholds["disk_usage"]:
            alerts.append({
                "type": "disk_high",
                "severity": "critical",
                "message": f"Disk usage is critical: {self.system_status['disk']['usage']:.1f}%",
                "timestamp": datetime.now().isoformat(),
                "value": self.system_status["disk"]["usage"]
            })
            
        # Network alert
        if self.system_status["network"]["latency"] > self.alert_thresholds["network_latency"]:
            alerts.append({
                "type": "network_slow",
                "severity": "warning",
                "message": f"Network latency is high: {self.system_status['network']['latency']:.1f}ms",
                "timestamp": datetime.now().isoformat(),
                "value": self.system_status["network"]["latency"]
            })
            
        # Add new alerts
        for alert in alerts:
            if not any(a["type"] == alert["type"] and 
                      (datetime.now() - datetime.fromisoformat(a["timestamp"])).seconds < 60 
                      for a in self.performance_alerts):
                self.performance_alerts.append(alert)
                
        # Clean old alerts (older than 1 hour)
        self.performance_alerts = [
            alert for alert in self.performance_alerts
            if (datetime.now() - datetime.fromisoformat(alert["timestamp"])).seconds < 3600
        ]
        
    def _monitor_user_activity(self):
        """Monitor user activity patterns"""
        try:
            # Get current mouse position
            mouse_pos = pyautogui.position()
            
            # Update user activity
            self.user_activity.update({
                "last_mouse_move": datetime.now().isoformat(),
                "session_duration": self._calculate_session_duration()
            })
            
        except Exception as e:
            logger.error(f"Error monitoring user activity: {e}")
            
    def _monitor_applications(self):
        """Monitor running applications and active window"""
        try:
            # Get all window titles
            windows = gw.getAllTitles()
            active_window = gw.getActiveWindow()
            
            # Update applications list
            self.system_status["applications"] = [
                title for title in windows if title.strip()
            ]
            
            # Update active window
            if active_window:
                self.system_status["active_window"] = active_window.title
                
                # Track application usage
                app_name = self._extract_app_name(active_window.title)
                if app_name:
                    self.user_activity["active_applications"].add(app_name)
                    
        except Exception as e:
            logger.error(f"Error monitoring applications: {e}")
            
    def _store_metrics(self):
        """Store metrics in history"""
        metrics_entry = {
            "timestamp": datetime.now().isoformat(),
            "cpu_usage": self.system_status["cpu"]["usage"],
            "memory_usage": self.system_status["memory"]["usage"],
            "disk_usage": self.system_status["disk"]["usage"],
            "network_latency": self.system_status["network"]["latency"],
            "active_applications": len(self.system_status["applications"])
        }
        
        self.metrics_history.append(metrics_entry)
        
        # Keep only last 100 entries
        if len(self.metrics_history) > 100:
            self.metrics_history = self.metrics_history[-100:]
            
    def _trigger_callbacks(self):
        """Trigger registered callbacks"""
        for event_type, callbacks in self.callbacks.items():
            for callback in callbacks:
                try:
                    if event_type == "metrics_update":
                        callback(self.system_status)
                    elif event_type == "performance_alert":
                        if self.performance_alerts:
                            callback(self.performance_alerts[-1])
                    elif event_type == "application_change":
                        callback(self.system_status["applications"])
                except Exception as e:
                    logger.error(f"Callback error for {event_type}: {e}")
                    
    def _measure_network_latency(self) -> float:
        """Measure network latency to a reliable host"""
        try:
            import socket
            start_time = time.time()
            socket.create_connection(("8.8.8.8", 53), timeout=1)
            return (time.time() - start_time) * 1000  # Convert to milliseconds
        except:
            return 0.0
            
    def _get_network_bandwidth(self) -> float:
        """Get current network bandwidth usage"""
        try:
            net_io = psutil.net_io_counters()
            return (net_io.bytes_sent + net_io.bytes_recv) / (1024**2)  # MB
        except:
            return 0.0
            
    def _get_cpu_temperature(self) -> float:
        """Get CPU temperature (platform dependent)"""
        try:
            # This is a simplified implementation
            # Real implementation would use platform-specific methods
            return 45.0 + (self.system_status["cpu"]["usage"] * 0.3)
        except:
            return 0.0
            
    def _calculate_session_duration(self) -> int:
        """Calculate current session duration in seconds"""
        # Simplified - in real implementation, track session start
        return 3600  # 1 hour default
        
    def _extract_app_name(self, window_title: str) -> Optional[str]:
        """Extract application name from window title"""
        if not window_title:
            return None
            
        # Common application patterns
        app_patterns = {
            "chrome": "Chrome",
            "firefox": "Firefox",
            "code": "VS Code",
            "notepad": "Notepad",
            "word": "Word",
            "excel": "Excel",
            "powerpoint": "PowerPoint",
            "outlook": "Outlook",
            "slack": "Slack",
            "zoom": "Zoom"
        }
        
        title_lower = window_title.lower()
        for pattern, app_name in app_patterns.items():
            if pattern in title_lower:
                return app_name
                
        return None
        
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        return self.system_status.copy()
        
    def get_performance_alerts(self) -> List[Dict[str, Any]]:
        """Get current performance alerts"""
        return self.performance_alerts.copy()
        
    def get_metrics_history(self, minutes: int = 60) -> List[Dict[str, Any]]:
        """Get metrics history for the last N minutes"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        return [
            entry for entry in self.metrics_history
            if datetime.fromisoformat(entry["timestamp"]) > cutoff_time
        ]
        
    def get_user_activity(self) -> Dict[str, Any]:
        """Get current user activity status"""
        return self.user_activity.copy()
        
    def set_alert_thresholds(self, thresholds: Dict[str, float]):
        """Set custom alert thresholds"""
        self.alert_thresholds.update(thresholds)
        
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        if not self.metrics_history:
            return {"error": "No metrics available"}
            
        recent_metrics = self.get_metrics_history(10)  # Last 10 minutes
        
        if not recent_metrics:
            return {"error": "No recent metrics available"}
            
        return {
            "average_cpu": sum(m["cpu_usage"] for m in recent_metrics) / len(recent_metrics),
            "average_memory": sum(m["memory_usage"] for m in recent_metrics) / len(recent_metrics),
            "average_disk": sum(m["disk_usage"] for m in recent_metrics) / len(recent_metrics),
            "average_latency": sum(m["network_latency"] for m in recent_metrics) / len(recent_metrics),
            "active_alerts": len(self.performance_alerts),
            "session_duration": self.user_activity["session_duration"],
            "active_applications": len(self.user_activity["active_applications"])
        }

# Global real-time monitor instance
realtime_monitor = RealtimeMonitor() 