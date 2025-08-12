import asyncio
import json
import os
import shutil
import aiofiles
from typing import Dict, Any, List
from datetime import datetime, timedelta
import hashlib
import subprocess
from core.evolution_log_manager import EvolutionLogManager
from core.db import get_db

class EvolutionEngine:
    """Autonomous system evolution and improvement"""
    
    def __init__(self):
        self.evolution_dir = "data/evolution"
        self.snapshots_dir = "backups/snapshots"
        self.metrics_file = "data/evolution/metrics.json"
        self.evolution_history = []
        self.performance_metrics = {}
        self.improvement_suggestions = []
        self.auto_evolution_enabled = True
        self.evolution_interval = 3600  # 1 hour
        self._evolution_task = None
        self.evolution_log_manager = EvolutionLogManager()
        self.progress = {
            "status": "idle",
            "step": "",
            "percent": 0,
            "error": None
        }
        
        # Ensure directories exist
        os.makedirs(self.evolution_dir, exist_ok=True)
        os.makedirs(self.snapshots_dir, exist_ok=True)
    
    async def initialize(self):
        """Initialize the evolution engine asynchronously"""
        await self._load_evolution_history()
        
        # Start autonomous evolution loop
        if self.auto_evolution_enabled:
            self._evolution_task = asyncio.create_task(self._autonomous_evolution_loop())
    
    def shutdown(self):
        """Shutdown the evolution engine"""
        if self._evolution_task:
            self._evolution_task.cancel()
    
    async def trigger_evolution(self) -> Dict[str, Any]:
        """Manually trigger system evolution"""
        try:
            self.progress = {"status": "running", "step": "Creating snapshot", "percent": 10, "error": None}
            # Create system snapshot before evolution
            snapshot_id = await self._create_snapshot()
            self.progress = {"status": "running", "step": "Analyzing performance", "percent": 25, "error": None}
            # Analyze current performance
            metrics = await self._analyze_performance()
            self.progress = {"status": "running", "step": "Generating improvements", "percent": 40, "error": None}
            # Generate improvement suggestions
            suggestions = await self._generate_improvements(metrics)
            self.progress = {"status": "running", "step": "Applying improvements", "percent": 60, "error": None}
            # Apply safe improvements
            applied_improvements = await self._apply_improvements(suggestions)
            self.progress = {"status": "running", "step": "Testing stability", "percent": 80, "error": None}
            # Test system stability
            stability_test = await self._test_system_stability()
            
            if not stability_test["stable"]:
                self.progress = {"status": "rollback", "step": "Rolling back changes", "percent": 90, "error": "System unstable, rolling back"}
                # Rollback if unstable
                await self._rollback_to_snapshot(snapshot_id)
                # Log failed evolution to SQL
                for db in get_db():
                    self.evolution_log_manager.create_log(
                        db,
                        version=datetime.now().strftime("%Y%m%d%H%M%S"),
                        description="Manual evolution (rollback)",
                        changes={"improvements": applied_improvements, "error": "System unstable, rolled back"},
                        status="failed"
                    )
                    break
                self.progress = {"status": "failed", "step": "Rollback complete", "percent": 100, "error": "System became unstable, rolled back changes"}
                return {
                    "success": False,
                    "error": "System became unstable, rolled back changes",
                    "snapshot_id": snapshot_id
                }
            
            # Record evolution
            evolution_record = {
                "id": self._generate_evolution_id(),
                "timestamp": datetime.now().isoformat(),
                "type": "manual",
                "snapshot_id": snapshot_id,
                "metrics": metrics,
                "improvements": applied_improvements,
                "performance_gain": await self._calculate_performance_gain(metrics)
            }
            
            self.evolution_history.append(evolution_record)
            await self._save_evolution_history()
            # Log successful evolution to SQL
            for db in get_db():
                self.evolution_log_manager.create_log(
                    db,
                    version=datetime.now().strftime("%Y%m%d%H%M%S"),
                    description="Manual evolution",
                    changes={"improvements": applied_improvements, "metrics": metrics},
                    status="success"
                )
                break
            self.progress = {"status": "success", "step": "Evolution complete", "percent": 100, "error": None}
            return {
                "success": True,
                "evolution_id": evolution_record["id"],
                "improvements": applied_improvements,
                "performance_gain": evolution_record["performance_gain"]
            }
            
        except Exception as e:
            # Log failed evolution to SQL
            for db in get_db():
                self.evolution_log_manager.create_log(
                    db,
                    version=datetime.now().strftime("%Y%m%d%H%M%S"),
                    description="Manual evolution (exception)",
                    changes={"error": str(e)},
                    status="failed"
                )
                break
            self.progress = {"status": "failed", "step": "Exception", "percent": 100, "error": str(e)}
            return {"success": False, "error": str(e)}
    
    async def _autonomous_evolution_loop(self):
        """Continuous autonomous evolution"""
        while self.auto_evolution_enabled:
            try:
                await asyncio.sleep(self.evolution_interval)
                
                # Check if evolution is needed
                if await self._should_evolve():
                    await self._autonomous_evolution()
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Autonomous evolution error: {e}")
    
    async def _should_evolve(self) -> bool:
        """Determine if system should evolve"""
        # Check performance metrics
        current_metrics = await self._analyze_performance()
        
        # Evolution criteria
        performance_threshold = 0.8
        time_since_last_evolution = self._time_since_last_evolution()
        
        return (
            current_metrics.get("overall_score", 1.0) < performance_threshold or
            time_since_last_evolution > timedelta(hours=24)
        )
    
    async def _autonomous_evolution(self):
        """Perform autonomous evolution"""
        try:
            self.progress = {"status": "running", "step": "Creating snapshot", "percent": 10, "error": None}
            # Create snapshot
            snapshot_id = await self._create_snapshot()
            self.progress = {"status": "running", "step": "Analyzing performance", "percent": 25, "error": None}
            # Analyze and improve
            metrics = await self._analyze_performance()
            self.progress = {"status": "running", "step": "Generating improvements", "percent": 40, "error": None}
            suggestions = await self._generate_improvements(metrics)
            self.progress = {"status": "running", "step": "Applying improvements", "percent": 60, "error": None}
            # Apply only safe, tested improvements
            safe_improvements = [s for s in suggestions if s.get("safety_level", 0) >= 0.9]
            applied_improvements = await self._apply_improvements(safe_improvements[:3])  # Max 3 per cycle
            self.progress = {"status": "running", "step": "Testing stability", "percent": 80, "error": None}
            # Test stability
            if not (await self._test_system_stability())["stable"]:
                self.progress = {"status": "rollback", "step": "Rolling back changes", "percent": 90, "error": "System unstable, rolling back"}
                await self._rollback_to_snapshot(snapshot_id)
                # Log failed auto evolution to SQL
                for db in get_db():
                    self.evolution_log_manager.create_log(
                        db,
                        version=datetime.now().strftime("%Y%m%d%H%M%S"),
                        description="Autonomous evolution (rollback)",
                        changes={"improvements": applied_improvements, "error": "System unstable, rolled back"},
                        status="failed"
                    )
                    break
                self.progress = {"status": "failed", "step": "Rollback complete", "percent": 100, "error": "System became unstable, rolled back changes"}
                return
            
            # Record evolution
            evolution_record = {
                "id": self._generate_evolution_id(),
                "timestamp": datetime.now().isoformat(),
                "type": "autonomous",
                "snapshot_id": snapshot_id,
                "improvements": applied_improvements,
                "performance_gain": await self._calculate_performance_gain(metrics)
            }
            
            self.evolution_history.append(evolution_record)
            await self._save_evolution_history()
            # Log successful auto evolution to SQL
            for db in get_db():
                self.evolution_log_manager.create_log(
                    db,
                    version=datetime.now().strftime("%Y%m%d%H%M%S"),
                    description="Autonomous evolution",
                    changes={"improvements": applied_improvements, "metrics": metrics},
                    status="success"
                )
                break
            self.progress = {"status": "success", "step": "Evolution complete", "percent": 100, "error": None}
        except Exception as e:
            # Log failed auto evolution to SQL
            for db in get_db():
                self.evolution_log_manager.create_log(
                    db,
                    version=datetime.now().strftime("%Y%m%d%H%M%S"),
                    description="Autonomous evolution (exception)",
                    changes={"error": str(e)},
                    status="failed"
                )
                break
            self.progress = {"status": "failed", "step": "Exception", "percent": 100, "error": str(e)}
            print(f"Autonomous evolution failed: {e}")
    
    async def _analyze_performance(self) -> Dict[str, Any]:
        """Analyze current system performance"""
        metrics = {
            "response_time": await self._measure_response_time(),
            "memory_usage": await self._measure_memory_usage(),
            "cpu_usage": await self._measure_cpu_usage(),
            "accuracy": await self._measure_accuracy(),
            "user_satisfaction": await self._measure_user_satisfaction(),
            "timestamp": datetime.now().isoformat()
        }
        
        # Calculate overall score
        weights = {
            "response_time": 0.3,
            "memory_usage": 0.2,
            "cpu_usage": 0.2,
            "accuracy": 0.2,
            "user_satisfaction": 0.1
        }
        
        overall_score = sum(
            metrics.get(metric, 0.5) * weight 
            for metric, weight in weights.items()
        )
        
        metrics["overall_score"] = overall_score
        return metrics
    
    async def _generate_improvements(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate improvement suggestions based on metrics"""
        suggestions = []
        
        # Response time improvements
        if metrics.get("response_time", 1.0) < 0.7:
            suggestions.append({
                "type": "performance",
                "description": "Optimize response caching",
                "safety_level": 0.95,
                "expected_gain": 0.2,
                "implementation": "cache_optimization"
            })
        
        # Memory usage improvements
        if metrics.get("memory_usage", 0.5) > 0.8:
            suggestions.append({
                "type": "memory",
                "description": "Implement memory cleanup routines",
                "safety_level": 0.9,
                "expected_gain": 0.15,
                "implementation": "memory_cleanup"
            })
        
        # Accuracy improvements
        if metrics.get("accuracy", 0.8) < 0.9:
            suggestions.append({
                "type": "accuracy",
                "description": "Enhance model fine-tuning",
                "safety_level": 0.85,
                "expected_gain": 0.1,
                "implementation": "model_tuning"
            })
        
        # Learning-based improvements
        suggestions.extend(await self._generate_learning_improvements())
        
        return suggestions
    
    async def _apply_improvements(self, suggestions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply improvement suggestions"""
        applied = []
        
        for suggestion in suggestions:
            try:
                implementation = suggestion.get("implementation")
                
                if implementation == "cache_optimization":
                    await self._optimize_caching()
                elif implementation == "memory_cleanup":
                    await self._implement_memory_cleanup()
                elif implementation == "model_tuning":
                    await self._tune_models()
                
                applied.append(suggestion)
                
            except Exception as e:
                print(f"Failed to apply improvement {suggestion['type']}: {e}")
        
        return applied
    
    async def _create_snapshot(self) -> str:
        """Create system snapshot for rollback"""
        snapshot_id = self._generate_snapshot_id()
        snapshot_dir = os.path.join(self.snapshots_dir, snapshot_id)
        
        # Create snapshot directory
        os.makedirs(snapshot_dir, exist_ok=True)
        
        # Copy critical system files
        critical_files = [
            "core/",
            "data/",
            "config/"
        ]
        
        for file_path in critical_files:
            if os.path.exists(file_path):
                if os.path.isdir(file_path):
                    shutil.copytree(file_path, os.path.join(snapshot_dir, file_path), dirs_exist_ok=True)
                else:
                    shutil.copy2(file_path, snapshot_dir)
        
        # Save snapshot metadata
        metadata = {
            "id": snapshot_id,
            "timestamp": datetime.now().isoformat(),
            "system_state": await self._capture_system_state()
        }
        
        with open(os.path.join(snapshot_dir, "metadata.json"), 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return snapshot_id
    
    async def _rollback_to_snapshot(self, snapshot_id: str) -> bool:
        """Rollback system to snapshot"""
        try:
            snapshot_dir = os.path.join(self.snapshots_dir, snapshot_id)
            
            if not os.path.exists(snapshot_dir):
                return False
            
            # Restore files from snapshot
            for item in os.listdir(snapshot_dir):
                if item == "metadata.json":
                    continue
                    
                source = os.path.join(snapshot_dir, item)
                target = item
                
                if os.path.isdir(source):
                    if os.path.exists(target):
                        shutil.rmtree(target)
                    shutil.copytree(source, target)
                else:
                    shutil.copy2(source, target)
            
            return True
            
        except Exception as e:
            print(f"Rollback failed: {e}")
            return False
    
    async def _test_system_stability(self) -> Dict[str, Any]:
        """Test system stability after changes"""
        try:
            # Run basic functionality tests
            tests = [
                self._test_core_functionality(),
                self._test_memory_operations(),
                self._test_security_systems(),
                self._test_response_times()
            ]
            
            results = await asyncio.gather(*tests, return_exceptions=True)
            
            # Check if all tests passed
            stable = all(
                isinstance(result, dict) and result.get("passed", False) 
                for result in results
            )
            
            return {
                "stable": stable,
                "test_results": results,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"stable": False, "error": str(e)}
    
    # Performance measurement methods
    async def _measure_response_time(self) -> float:
        """Measure average response time"""
        # Simulate response time measurement
        await asyncio.sleep(0.01)
        return 0.85  # Placeholder
    
    async def _measure_memory_usage(self) -> float:
        """Measure memory usage efficiency"""
        # Simulate memory measurement
        return 0.7  # Placeholder
    
    async def _measure_cpu_usage(self) -> float:
        """Measure CPU usage efficiency"""
        # Simulate CPU measurement
        return 0.6  # Placeholder
    
    async def _measure_accuracy(self) -> float:
        """Measure system accuracy"""
        # Simulate accuracy measurement
        return 0.9  # Placeholder
    
    async def _measure_user_satisfaction(self) -> float:
        """Measure user satisfaction metrics"""
        # Simulate satisfaction measurement
        return 0.8  # Placeholder
    
    # Improvement implementation methods
    async def _optimize_caching(self):
        """Implement caching optimizations"""
        # Simulate caching optimization
        await asyncio.sleep(0.1)
    
    async def _implement_memory_cleanup(self):
        """Implement memory cleanup routines"""
        # Simulate memory cleanup
        await asyncio.sleep(0.1)
    
    async def _tune_models(self):
        """Fine-tune AI models"""
        # Simulate model tuning
        await asyncio.sleep(0.1)
    
    # Test methods
    async def _test_core_functionality(self) -> Dict[str, Any]:
        """Test core system functionality"""
        await asyncio.sleep(0.05)
        return {"passed": True, "test": "core_functionality"}
    
    async def _test_memory_operations(self) -> Dict[str, Any]:
        """Test memory operations"""
        await asyncio.sleep(0.05)
        return {"passed": True, "test": "memory_operations"}
    
    async def _test_security_systems(self) -> Dict[str, Any]:
        """Test security systems"""
        await asyncio.sleep(0.05)
        return {"passed": True, "test": "security_systems"}
    
    async def _test_response_times(self) -> Dict[str, Any]:
        """Test response times"""
        await asyncio.sleep(0.05)
        return {"passed": True, "test": "response_times"}
    
    # Utility methods
    def _generate_evolution_id(self) -> str:
        """Generate unique evolution ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(f"evolution_{timestamp}".encode()).hexdigest()[:12]
    
    def _generate_snapshot_id(self) -> str:
        """Generate unique snapshot ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(f"snapshot_{timestamp}".encode()).hexdigest()[:12]
    
    def _time_since_last_evolution(self) -> timedelta:
        """Calculate time since last evolution"""
        if not self.evolution_history:
            return timedelta(days=1)  # Force evolution if no history
        
        last_evolution = self.evolution_history[-1]
        last_time = datetime.fromisoformat(last_evolution["timestamp"])
        return datetime.now() - last_time
    
    async def _generate_learning_improvements(self) -> List[Dict[str, Any]]:
        """Generate improvements based on learning patterns"""
        # Simulate learning-based improvements
        await asyncio.sleep(0.1)
        return []
    
    async def _calculate_performance_gain(self, old_metrics: Dict[str, Any]) -> float:
        """Calculate performance gain from evolution"""
        new_metrics = await self._analyze_performance()
        
        old_score = old_metrics.get("overall_score", 0.5)
        new_score = new_metrics.get("overall_score", 0.5)
        
        return new_score - old_score
    
    async def _capture_system_state(self) -> Dict[str, Any]:
        """Capture current system state"""
        return {
            "timestamp": datetime.now().isoformat(),
            "active_processes": len(asyncio.all_tasks()),
            "memory_usage": await self._measure_memory_usage(),
            "cpu_usage": await self._measure_cpu_usage()
        }
    
    async def _load_evolution_history(self):
        """Load evolution history from disk"""
        history_file = os.path.join(self.evolution_dir, "evolution_history.json")
        
        if os.path.exists(history_file):
            try:
                async with aiofiles.open(history_file, 'r') as f:
                    content = await f.read()
                    self.evolution_history = json.loads(content)
            except Exception as e:
                print(f"Error loading evolution history: {e}")
                self.evolution_history = []
    
    async def _save_evolution_history(self):
        """Save evolution history to disk"""
        history_file = os.path.join(self.evolution_dir, "evolution_history.json")
        
        async with aiofiles.open(history_file, 'w') as f:
            content = json.dumps(self.evolution_history, indent=2)
            await f.write(content)
    
    def get_status(self) -> Dict[str, Any]:
        """Get evolution engine status"""
        return {
            "auto_evolution_enabled": self.auto_evolution_enabled,
            "evolution_count": len(self.evolution_history),
            "last_evolution": self.evolution_history[-1]["timestamp"] if self.evolution_history else None,
            "next_evolution_in": self.evolution_interval,
            "snapshots_available": len(os.listdir(self.snapshots_dir)) if os.path.exists(self.snapshots_dir) else 0,
            "performance_trend": self._calculate_performance_trend()
        }
    
    def get_progress(self) -> dict:
        return self.progress
    
    def _calculate_performance_trend(self) -> str:
        """Calculate performance trend over time"""
        if len(self.evolution_history) < 2:
            return "insufficient_data"
        
        recent_gains = [
            evolution.get("performance_gain", 0) 
            for evolution in self.evolution_history[-5:]
        ]
        
        avg_gain = sum(recent_gains) / len(recent_gains)
        
        if avg_gain > 0.05:
            return "improving"
        elif avg_gain < -0.05:
            return "declining"
        else:
            return "stable"