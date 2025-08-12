"""
J.A.R.V.I.S System Automation Module
Provides complete system control capabilities
"""

import asyncio
import subprocess
import os
import json
import time
import logging
from typing import Dict, List, Any, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import pyautogui
import psutil
import requests
import boto3
from pathlib import Path
import pygetwindow as gw
import pyautogui
import threading
import time
from typing import Dict, Any, List
from .calendar_integration import CalendarIntegration
from core.models import UserSettings, User
from core.db import get_db
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

calendar_integration = CalendarIntegration()

class AgentModeManager:
    def __init__(self):
        self._user_active = defaultdict(bool)
        self._user_lock = defaultdict(threading.Lock)
        self._user_last_context = defaultdict(dict)
        self._user_monitor_thread = {}
        self._user_suggestions = defaultdict(list)
        self._user_last_triggered = defaultdict(set)
        self._user_last_meeting_ids = defaultdict(set)
        # New: Track idle time, focus/break state, last suggestion times
        self._user_last_activity = defaultdict(lambda: time.time())
        self._user_focus_state = defaultdict(lambda: None)  # None, 'focus', 'break'
        self._user_focus_start = defaultdict(lambda: None)
        self._user_break_start = defaultdict(lambda: None)
        self._user_last_suggestion_time = defaultdict(lambda: 0)
        self._user_goal_set = defaultdict(lambda: False)

    def set_agent_mode(self, active: bool, username: str = 'Hemal'):
        with self._user_lock[username]:
            self._user_active[username] = active
        if active and (username not in self._user_monitor_thread or not self._user_monitor_thread[username].is_alive()):
            t = threading.Thread(target=self._monitor_loop, args=(username,), daemon=True)
            self._user_monitor_thread[username] = t
            t.start()

    def is_agent_mode_active(self, username: str = 'Hemal') -> bool:
        with self._user_lock[username]:
            return self._user_active[username]

    def get_screen_context(self, username: str = 'Hemal') -> Dict[str, Any]:
        with self._user_lock[username]:
            return self._user_last_context[username].copy()

    def get_suggestions(self, username: str = 'Hemal') -> List[Dict[str, Any]]:
        with self._user_lock[username]:
            suggestions = self._user_suggestions[username].copy()
            self._user_suggestions[username].clear()
            return suggestions

    def _monitor_loop(self, username: str):
        import contextlib
        calendar_check_counter = 0
        idle_threshold = 10 * 60  # 10 minutes
        focus_block_length = 25 * 60  # 25 minutes
        break_length = 5 * 60  # 5 minutes
        suggestion_cooldown = 5 * 60  # 5 minutes between same suggestion
        while self.is_agent_mode_active(username):
            try:
                # Fetch user settings
                with contextlib.closing(next(get_db())) as db:
                    user = db.query(User).filter_by(username=username).first()
                    settings = db.query(UserSettings).filter_by(user_id=user.id).first() if user else None
                    enable_meeting_reminders = settings.enable_meeting_reminders if settings else True
                    enable_app_suggestions = settings.enable_app_suggestions if settings else True
                windows = gw.getAllTitles()
                active_window = gw.getActiveWindow()
                context = {
                    "window_titles": windows,
                    "active_window": active_window.title if active_window else None,
                }
                with self._user_lock[username]:
                    self._user_last_context[username] = context
                # --- Idle time detection ---
                idle_time = self._get_idle_time()
                now = time.time()
                if idle_time > idle_threshold and now - self._user_last_suggestion_time[(username, 'idle')] > suggestion_cooldown:
                    suggestion = {
                        "message": "You've been idle for a while. Would you like to take a break or start a focus block?",
                        "action": {
                            "label": "Start Focus Block",
                            "endpoint": "/api/user/focus/start",
                            "payload": {"username": username}
                        }
                    }
                    with self._user_lock[username]:
                        self._user_suggestions[username].append(suggestion)
                    self._user_last_suggestion_time[(username, 'idle')] = now
                # --- Focus block logic ---
                focus_state = self._user_focus_state[username]
                if focus_state == 'focus':
                    elapsed = now - (self._user_focus_start[username] or now)
                    if elapsed > focus_block_length and now - self._user_last_suggestion_time[(username, 'focus_end')] > suggestion_cooldown:
                        suggestion = {
                            "message": "Focus block complete! Would you like to take a break?",
                            "action": {
                                "label": "Start Break",
                                "endpoint": "/api/user/break/start",
                                "payload": {"username": username}
                            }
                        }
                        with self._user_lock[username]:
                            self._user_suggestions[username].append(suggestion)
                        self._user_last_suggestion_time[(username, 'focus_end')] = now
                elif focus_state == 'break':
                    elapsed = now - (self._user_break_start[username] or now)
                    if elapsed > break_length and now - self._user_last_suggestion_time[(username, 'break_end')] > suggestion_cooldown:
                        suggestion = {
                            "message": "Break is over! Ready to start another focus block?",
                            "action": {
                                "label": "Start Focus Block",
                                "endpoint": "/api/user/focus/start",
                                "payload": {"username": username}
                            }
                        }
                        with self._user_lock[username]:
                            self._user_suggestions[username].append(suggestion)
                        self._user_last_suggestion_time[(username, 'break_end')] = now
                # --- System status suggestions ---
                cpu = psutil.cpu_percent()
                mem = psutil.virtual_memory().percent
                if (cpu > 90 or mem > 90) and now - self._user_last_suggestion_time[(username, 'system_status')] > suggestion_cooldown:
                    suggestion = {
                        "message": f"System resources are high (CPU: {cpu}%, Memory: {mem}%). Consider closing unused apps.",
                        "action": None
                    }
                    with self._user_lock[username]:
                        self._user_suggestions[username].append(suggestion)
                    self._user_last_suggestion_time[(username, 'system_status')] = now
                # --- Daily goal reminder ---
                if not self._user_goal_set[username] and now - self._user_last_suggestion_time[(username, 'goal')] > suggestion_cooldown:
                    suggestion = {
                        "message": "Set your daily goal to stay focused!",
                        "action": {
                            "label": "Set Goal",
                            "endpoint": "/api/user/goal/set",
                            "payload": {"username": username}
                        }
                    }
                    with self._user_lock[username]:
                        self._user_suggestions[username].append(suggestion)
                    self._user_last_suggestion_time[(username, 'goal')] = now
                # --- Existing app and meeting triggers ---
                if enable_app_suggestions:
                    triggers = [
                        ("VS Code", {
                            "message": "You opened VS Code. Would you like to open your project files?",
                            "action": {
                                "label": "Open Project",
                                "endpoint": "/api/command",
                                "payload": {"text": "Open my main project in VS Code"}
                            }
                        }),
                        ("Chrome", {
                            "message": "You opened Chrome. Need help navigating to a site or logging in?",
                            "action": {
                                "label": "Go to AWS Console",
                                "endpoint": "/api/command",
                                "payload": {"text": "Open AWS Console in Chrome"}
                            }
                        }),
                        ("Word", {
                            "message": "You opened Word. Want to open a recent document or start a new one?",
                            "action": None
                        }),
                        ("PowerPoint", {
                            "message": "You opened PowerPoint. Need help with your presentation?",
                            "action": None
                        }),
                        ("Excel", {
                            "message": "You opened Excel. Would you like to open your budget spreadsheet?",
                            "action": {
                                "label": "Open Budget Sheet",
                                "endpoint": "/api/command",
                                "payload": {"text": "Open budget.xlsx in Excel"}
                            }
                        }),
                        ("Slack", {
                            "message": "You opened Slack. Would you like to check unread messages?",
                            "action": {
                                "label": "Check Unread",
                                "endpoint": "/api/command",
                                "payload": {"text": "Show unread messages in Slack"}
                            }
                        }),
                        ("Zoom", {
                            "message": "You opened Zoom. Would you like to join your next meeting?",
                            "action": {
                                "label": "Join Meeting",
                                "endpoint": "/api/command",
                                "payload": {"text": "Join next Zoom meeting"}
                            }
                        }),
                        ("Outlook", {
                            "message": "You opened Outlook. Would you like to check your inbox or compose a new email?",
                            "action": {
                                "label": "New Email",
                                "endpoint": "/api/command",
                                "payload": {"text": "Compose new email in Outlook"}
                            }
                        }),
                        ("Notepad", {
                            "message": "You opened Notepad. Would you like to open your notes?",
                            "action": {
                                "label": "Open Notes",
                                "endpoint": "/api/command",
                                "payload": {"text": "Open notes.txt in Notepad"}
                            }
                        })
                    ]
                    for keyword, suggestion in triggers:
                        if any(keyword.lower() in (t or '').lower() for t in windows):
                            if keyword not in self._user_last_triggered[username]:
                                with self._user_lock[username]:
                                    self._user_suggestions[username].append(suggestion)
                                self._user_last_triggered[username].add(keyword)
                        else:
                            self._user_last_triggered[username].discard(keyword)
                # Calendar integration: check every 3 cycles (~6s)
                calendar_check_counter += 1
                if enable_meeting_reminders and calendar_check_counter % 3 == 0:
                    meetings = calendar_integration.get_imminent_meetings(minutes=10)
                    for meeting in meetings:
                        meeting_id = f"{meeting.get('summary','')}-{meeting.get('start','')}"
                        if meeting_id not in self._user_last_meeting_ids[username]:
                            minutes_left = self._minutes_until(meeting.get('start'))
                            suggestion = {
                                "message": f"Your meeting '{meeting.get('summary','(no title)')}' starts in {minutes_left} minutes. Join now?",
                                "action": {
                                    "label": "Join Meeting",
                                    "endpoint": "/api/command",
                                    "payload": {"text": f"Open meeting link: {meeting.get('link','')}"}
                                }
                            }
                            with self._user_lock[username]:
                                self._user_suggestions[username].append(suggestion)
                            self._user_last_meeting_ids[username].add(meeting_id)
            except Exception as e:
                with self._user_lock[username]:
                    self._user_last_context[username] = {"error": str(e)}
            time.sleep(2)

    def _get_idle_time(self):
        # Cross-platform idle time detection (simple version)
        try:
            if os.name == 'nt':
                import ctypes
                class LASTINPUTINFO(ctypes.Structure):
                    _fields_ = [('cbSize', ctypes.c_uint), ('dwTime', ctypes.c_uint)]
                lii = LASTINPUTINFO()
                lii.cbSize = ctypes.sizeof(LASTINPUTINFO)
                if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii)):
                    millis = ctypes.windll.kernel32.GetTickCount() - lii.dwTime
                    return millis / 1000.0
            # For Linux/Mac, fallback to 0 (could use Xlib or Quartz for real impl)
            return 0
        except Exception:
            return 0

    def _minutes_until(self, start_str):
        import datetime
        now = datetime.datetime.utcnow()
        try:
            if 'T' in start_str:
                start_dt = datetime.datetime.fromisoformat(start_str.replace('Z', ''))
                delta = (start_dt - now).total_seconds() / 60
                return max(0, int(delta))
        except Exception:
            pass
        return '?'

# Singleton instance
agent_mode_manager = AgentModeManager()

class SystemAutomation:
    """
    Complete system automation for J.A.R.V.I.S
    Provides capabilities to control everything a human can do
    """
    
    def __init__(self):
        self.driver = None
        self.aws_session = None
        self.active_processes = {}
        self.setup_automation()
    
    def setup_automation(self):
        """Initialize automation tools"""
        # Setup PyAutoGUI
        pyautogui.FAILSAFE = True
        pyautogui.PAUSE = 0.5
        
        # Setup Chrome options for automation
        self.chrome_options = Options()
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--remote-debugging-port=9222")
        self.chrome_options.add_experimental_option("useAutomationExtension", False)
        self.chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
    async def execute_complex_task(self, task_description: str) -> Dict[str, Any]:
        """
        Execute complex multi-step tasks based on natural language description
        Example: "Create pipeline for solar plants usage in Ontario"
        """
        logger.info(f"Executing complex task: {task_description}")
        
        # Parse the task and create execution plan
        execution_plan = await self.create_execution_plan(task_description)
        
        results = []
        for step in execution_plan:
            try:
                result = await self.execute_step(step)
                results.append(result)
                logger.info(f"Step completed: {step['description']}")
            except Exception as e:
                logger.error(f"Step failed: {step['description']} - {str(e)}")
                results.append({"error": str(e), "step": step})
        
        return {
            "task": task_description,
            "execution_plan": execution_plan,
            "results": results,
            "status": "completed"
        }
    
    async def create_execution_plan(self, task: str) -> List[Dict[str, Any]]:
        """Create detailed execution plan for complex tasks"""
        
        # Example for solar pipeline task
        if "solar" in task.lower() and "pipeline" in task.lower():
            return [
                {
                    "type": "browser_automation",
                    "action": "open_aws_console",
                    "description": "Open AWS Console",
                    "url": "https://aws.amazon.com/console/"
                },
                {
                    "type": "browser_automation", 
                    "action": "login_aws",
                    "description": "Login to AWS",
                    "credentials_source": "environment"
                },
                {
                    "type": "aws_operation",
                    "action": "create_lambda_function",
                    "description": "Create Lambda function for solar data processing",
                    "function_name": "solar-ontario-pipeline",
                    "runtime": "python3.9"
                },
                {
                    "type": "aws_operation",
                    "action": "create_s3_bucket",
                    "description": "Create S3 bucket for solar data storage",
                    "bucket_name": "solar-ontario-data"
                },
                {
                    "type": "code_generation",
                    "action": "generate_pipeline_code",
                    "description": "Generate solar pipeline code",
                    "language": "python"
                },
                {
                    "type": "aws_operation",
                    "action": "deploy_pipeline",
                    "description": "Deploy complete solar pipeline",
                    "components": ["lambda", "s3", "cloudwatch"]
                }
            ]
        
        # Generic task breakdown
        return [
            {
                "type": "analysis",
                "action": "analyze_task",
                "description": f"Analyze and break down: {task}"
            }
        ]
    
    async def execute_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute individual step in the execution plan"""
        
        step_type = step.get("type")
        action = step.get("action")
        
        if step_type == "browser_automation":
            return await self.execute_browser_action(step)
        elif step_type == "aws_operation":
            return await self.execute_aws_operation(step)
        elif step_type == "system_operation":
            return await self.execute_system_operation(step)
        elif step_type == "code_generation":
            return await self.execute_code_generation(step)
        elif step_type == "file_operation":
            return await self.execute_file_operation(step)
        else:
            return {"error": f"Unknown step type: {step_type}"}
    
    async def execute_browser_action(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute browser automation actions"""
        action = step.get("action")
        
        if not self.driver:
            self.driver = webdriver.Chrome(options=self.chrome_options)
        
        try:
            if action == "open_aws_console":
                self.driver.get("https://aws.amazon.com/console/")
                await asyncio.sleep(2)
                return {"status": "success", "action": "AWS Console opened"}
            
            elif action == "login_aws":
                # Find and fill login form
                username_field = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "username"))
                )
                password_field = self.driver.find_element(By.ID, "password")
                
                # Get credentials from environment or secure storage
                username = os.getenv("AWS_USERNAME", "demo@example.com")
                password = os.getenv("AWS_PASSWORD", "demopassword")
                
                username_field.send_keys(username)
                password_field.send_keys(password)
                password_field.send_keys(Keys.RETURN)
                
                await asyncio.sleep(3)
                return {"status": "success", "action": "AWS login completed"}
            
            elif action == "navigate_to_service":
                service = step.get("service", "lambda")
                search_box = self.driver.find_element(By.ID, "awsc-nav-service-search")
                search_box.clear()
                search_box.send_keys(service)
                search_box.send_keys(Keys.RETURN)
                await asyncio.sleep(2)
                return {"status": "success", "action": f"Navigated to {service}"}
            
            elif action == "create_resource":
                # Generic resource creation
                create_button = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create')]"))
                )
                create_button.click()
                await asyncio.sleep(2)
                return {"status": "success", "action": "Resource creation initiated"}
            
            else:
                return {"error": f"Unknown browser action: {action}"}
                
        except Exception as e:
            return {"error": f"Browser action failed: {str(e)}"}
    
    async def execute_aws_operation(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute AWS operations using boto3"""
        action = step.get("action")
        
        try:
            if not self.aws_session:
                self.aws_session = boto3.Session(
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                    region_name=os.getenv("AWS_REGION", "us-east-1")
                )
            
            if action == "create_lambda_function":
                lambda_client = self.aws_session.client('lambda')
                
                function_name = step.get("function_name", "jarvis-function")
                runtime = step.get("runtime", "python3.9")
                
                # Create basic Lambda function
                response = lambda_client.create_function(
                    FunctionName=function_name,
                    Runtime=runtime,
                    Role=f"arn:aws:iam::{self.get_account_id()}:role/lambda-execution-role",
                    Handler='lambda_function.lambda_handler',
                    Code={'ZipFile': self.get_default_lambda_code()},
                    Description='Created by J.A.R.V.I.S'
                )
                
                return {
                    "status": "success",
                    "action": "Lambda function created",
                    "function_arn": response['FunctionArn']
                }
            
            elif action == "create_s3_bucket":
                s3_client = self.aws_session.client('s3')
                bucket_name = step.get("bucket_name", "jarvis-bucket")
                
                s3_client.create_bucket(Bucket=bucket_name)
                
                return {
                    "status": "success",
                    "action": "S3 bucket created",
                    "bucket_name": bucket_name
                }
            
            elif action == "deploy_pipeline":
                # Deploy complete pipeline
                components = step.get("components", [])
                results = []
                
                for component in components:
                    if component == "lambda":
                        result = await self.execute_aws_operation({
                            "action": "create_lambda_function",
                            "function_name": "solar-pipeline-processor"
                        })
                        results.append(result)
                    
                    elif component == "s3":
                        result = await self.execute_aws_operation({
                            "action": "create_s3_bucket",
                            "bucket_name": "solar-ontario-data"
                        })
                        results.append(result)
                
                return {
                    "status": "success",
                    "action": "Pipeline deployed",
                    "components": results
                }
            
            else:
                return {"error": f"Unknown AWS action: {action}"}
                
        except Exception as e:
            return {"error": f"AWS operation failed: {str(e)}"}
    
    async def execute_system_operation(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute system-level operations"""
        action = step.get("action")
        
        try:
            if action == "run_command":
                command = step.get("command")
                result = subprocess.run(command, shell=True, capture_output=True, text=True)
                
                return {
                    "status": "success",
                    "action": "Command executed",
                    "output": result.stdout,
                    "error": result.stderr,
                    "return_code": result.returncode
                }
            
            elif action == "install_package":
                package = step.get("package")
                result = subprocess.run(f"pip install {package}", shell=True, capture_output=True, text=True)
                
                return {
                    "status": "success",
                    "action": f"Package {package} installed",
                    "output": result.stdout
                }
            
            elif action == "create_directory":
                directory = step.get("directory")
                os.makedirs(directory, exist_ok=True)
                
                return {
                    "status": "success",
                    "action": f"Directory {directory} created"
                }
            
            else:
                return {"error": f"Unknown system action: {action}"}
                
        except Exception as e:
            return {"error": f"System operation failed: {str(e)}"}
    
    async def execute_code_generation(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Generate code for specific tasks"""
        action = step.get("action")
        
        if action == "generate_pipeline_code":
            language = step.get("language", "python")
            
            if language == "python":
                code = self.generate_solar_pipeline_code()
                
                # Save the generated code
                with open("solar_pipeline.py", "w") as f:
                    f.write(code)
                
                return {
                    "status": "success",
                    "action": "Solar pipeline code generated",
                    "file": "solar_pipeline.py",
                    "code_length": len(code)
                }
        
        return {"error": f"Unknown code generation action: {action}"}
    
    async def execute_file_operation(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute file operations"""
        action = step.get("action")
        
        try:
            if action == "create_file":
                filename = step.get("filename")
                content = step.get("content", "")
                
                with open(filename, "w") as f:
                    f.write(content)
                
                return {
                    "status": "success",
                    "action": f"File {filename} created"
                }
            
            elif action == "read_file":
                filename = step.get("filename")
                with open(filename, "r") as f:
                    content = f.read()
                
                return {
                    "status": "success",
                    "action": f"File {filename} read",
                    "content": content
                }
            
            else:
                return {"error": f"Unknown file action: {action}"}
                
        except Exception as e:
            return {"error": f"File operation failed: {str(e)}"}
    
    def get_account_id(self) -> str:
        """Get AWS account ID"""
        try:
            sts_client = self.aws_session.client('sts')
            return sts_client.get_caller_identity()['Account']
        except:
            return "123456789012"  # Default for demo
    
    def get_default_lambda_code(self) -> bytes:
        """Get default Lambda function code"""
        code = '''
import json

def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from J.A.R.V.I.S Lambda!')
    }
'''
        return code.encode('utf-8')
    
    def generate_solar_pipeline_code(self) -> str:
        """Generate solar pipeline processing code"""
        return '''
import json
import boto3
import pandas as pd
from datetime import datetime

def lambda_handler(event, context):
    """
    Solar Plants Usage Pipeline for Ontario
    Processes solar energy data and generates insights
    """
    
    s3_client = boto3.client('s3')
    
    try:
        # Process solar data
        solar_data = process_solar_data(event)
        
        # Generate insights
        insights = generate_solar_insights(solar_data)
        
        # Store results
        store_results(s3_client, insights)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Solar pipeline processed successfully',
                'insights': insights
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

def process_solar_data(event):
    """Process incoming solar data"""
    # Simulate solar data processing
    return {
        'total_capacity': 5000,  # MW
        'current_generation': 3500,  # MW
        'efficiency': 0.7,
        'timestamp': datetime.now().isoformat()
    }

def generate_solar_insights(data):
    """Generate insights from solar data"""
    return {
        'peak_generation_time': '12:00 PM',
        'efficiency_rating': 'Good',
        'recommended_actions': [
            'Optimize panel angle for winter season',
            'Schedule maintenance for underperforming units'
        ]
    }

def store_results(s3_client, insights):
    """Store results in S3"""
    bucket_name = 'solar-ontario-data'
    key = f'insights/{datetime.now().strftime("%Y/%m/%d")}/solar_insights.json'
    
    s3_client.put_object(
        Bucket=bucket_name,
        Key=key,
        Body=json.dumps(insights),
        ContentType='application/json'
    )
'''
    
    async def control_desktop_application(self, app_name: str, actions: List[str]) -> Dict[str, Any]:
        """Control desktop applications using PyAutoGUI"""
        try:
            # Launch application if not running
            if not self.is_application_running(app_name):
                subprocess.Popen(app_name)
                await asyncio.sleep(3)
            
            results = []
            for action in actions:
                result = await self.execute_desktop_action(action)
                results.append(result)
            
            return {
                "status": "success",
                "application": app_name,
                "actions_completed": len(results),
                "results": results
            }
            
        except Exception as e:
            return {"error": f"Desktop control failed: {str(e)}"}
    
    async def execute_desktop_action(self, action: str) -> Dict[str, Any]:
        """Execute desktop actions using PyAutoGUI"""
        try:
            if action.startswith("click"):
                # Parse click coordinates or element
                coords = self.parse_click_coordinates(action)
                pyautogui.click(coords[0], coords[1])
                return {"action": "click", "coordinates": coords}
            
            elif action.startswith("type"):
                # Parse text to type
                text = action.split(":", 1)[1].strip()
                pyautogui.typewrite(text)
                return {"action": "type", "text": text}
            
            elif action.startswith("key"):
                # Parse key combination
                keys = action.split(":", 1)[1].strip()
                pyautogui.hotkey(*keys.split("+"))
                return {"action": "key", "keys": keys}
            
            else:
                return {"error": f"Unknown desktop action: {action}"}
                
        except Exception as e:
            return {"error": f"Desktop action failed: {str(e)}"}
    
    def parse_click_coordinates(self, action: str) -> tuple:
        """Parse click coordinates from action string"""
        # Default center of screen
        screen_width, screen_height = pyautogui.size()
        return (screen_width // 2, screen_height // 2)
    
    def is_application_running(self, app_name: str) -> bool:
        """Check if application is running"""
        for proc in psutil.process_iter(['pid', 'name']):
            if app_name.lower() in proc.info['name'].lower():
                return True
        return False
    
    async def monitor_system_resources(self) -> Dict[str, Any]:
        """Monitor system resources"""
        return {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "network_io": psutil.net_io_counters()._asdict(),
            "running_processes": len(psutil.pids())
        }
    
    def cleanup(self):
        """Cleanup resources"""
        if self.driver:
            self.driver.quit()
        
        # Terminate any active processes
        for proc in self.active_processes.values():
            if proc.poll() is None:
                proc.terminate()

# Global instance
system_automation = SystemAutomation()