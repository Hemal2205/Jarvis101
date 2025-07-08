import asyncio
import json
import logging
import os
import shutil
import zipfile
import aiofiles
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class CopyEngine:
    """Enhanced copy engine for creating J.A.R.V.I.S copies"""
    
    def __init__(self):
        self.copies = {}
        self.copy_templates = {}
        self.master_key = None
        self.copies_dir = "data/copies"
        self.templates_dir = "data/templates"
        self.output_dir = "data/output"
        
        # Ensure directories exist
        os.makedirs(self.copies_dir, exist_ok=True)
        os.makedirs(self.templates_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def initialize(self):
        """Initialize the copy engine asynchronously"""
        await self._load_copies()
        await self._generate_master_key()
        await self._create_copy_templates()
    
    def get_status(self) -> Dict[str, Any]:
        """Get copy engine status"""
        return {
            "total_copies": len(self.copies),
            "active_copies": len([c for c in self.copies.values() if c.get("status") == "active"]),
            "disabled_copies": len([c for c in self.copies.values() if c.get("status") == "disabled"]),
            "master_key_set": self.master_key is not None,
            "templates_available": len(self.copy_templates),
            "storage_used": self._calculate_storage_usage()
        }
    
    def _calculate_storage_usage(self) -> str:
        """Calculate storage usage for copies"""
        try:
            total_size = 0
            for root, dirs, files in os.walk(self.output_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    total_size += os.path.getsize(file_path)
            
            # Convert to MB
            size_mb = total_size / (1024 * 1024)
            return f"{size_mb:.2f} MB"
        except Exception:
            return "Unknown"
    
    async def create_copy(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new J.A.R.V.I.S copy with enhanced features"""
        try:
            copy_id = str(uuid.uuid4())
            name = config.get("name", f"JARVIS_Copy_{copy_id[:8]}")
            creator = config.get("creator", "Unknown")
            copy_type = config.get("type", "standard")
            
            # Create copy metadata
            copy_metadata = {
                "id": copy_id,
                "name": name,
                "creator": creator,
                "type": copy_type,
                "created": datetime.now().isoformat(),
                "status": "active",
                "version": "1.0.0",
                "master_key": self.master_key,
                "capabilities": self._get_copy_capabilities(copy_type),
                "restrictions": self._get_copy_restrictions(copy_type),
                "last_update": datetime.now().isoformat(),
                "update_count": 0,
                "download_count": 0
            }
            
            # Store copy metadata
            self.copies[copy_id] = copy_metadata
            
            # Build copy package
            package_path = await self._build_copy_package(copy_metadata)
            
            # Save copies data
            await self._save_copies()
            
            logger.info(f"Copy created: {copy_id} for {creator}")
            
            return {
                "success": True,
                "copy_id": copy_id,
                "name": name,
                "download_url": f"/api/copy/download/{copy_id}",
                "package_path": package_path,
                "metadata": copy_metadata
            }
            
        except Exception as e:
            logger.error(f"Copy creation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_copy_capabilities(self, copy_type: str) -> List[str]:
        """Get capabilities based on copy type"""
        base_capabilities = [
            "natural_language_processing",
            "basic_task_automation",
            "simple_conversations"
        ]
        
        if copy_type == "advanced":
            base_capabilities.extend([
                "code_generation",
                "data_analysis",
                "learning_adaptation"
            ])
        elif copy_type == "enterprise":
            base_capabilities.extend([
                "code_generation",
                "data_analysis",
                "learning_adaptation",
                "team_collaboration",
                "workflow_automation"
            ])
        
        return base_capabilities
    
    def _get_copy_restrictions(self, copy_type: str) -> List[str]:
        """Get restrictions based on copy type"""
        base_restrictions = [
            "no_self_replication",
            "no_personal_data_access",
            "no_biometric_access",
            "no_memory_vault_access",
            "no_master_control"
        ]
        
        if copy_type == "limited":
            base_restrictions.extend([
                "no_internet_access",
                "no_file_system_access",
                "limited_processing_power"
            ])
        
        return base_restrictions
    
    async def _build_copy_package(self, metadata: Dict[str, Any]) -> str:
        """Build copy package with enhanced structure"""
        try:
            copy_id = metadata["id"]
            copy_dir = os.path.join(self.output_dir, copy_id)
            
            # Create directory structure
            os.makedirs(copy_dir, exist_ok=True)
            
            # Create package structure
            package_structure = {
                "frontend": ["src", "public", "package.json"],
                "backend": ["core", "api", "requirements.txt"],
                "config": ["settings.json", "capabilities.json"],
                "docs": ["README.md", "INSTALLATION.md"]
            }
            
            for folder, files in package_structure.items():
                folder_path = os.path.join(copy_dir, folder)
                os.makedirs(folder_path, exist_ok=True)
                
                for file in files:
                    file_path = os.path.join(folder_path, file)
                    await self._create_copy_file(file_path, metadata, folder, file)
            
            # Create installer package
            package_path = await self._create_installer_package(copy_id, copy_dir)
            
            return package_path
            
        except Exception as e:
            logger.error(f"Failed to build copy package: {e}")
            raise
    
    async def _create_copy_file(self, file_path: str, metadata: Dict[str, Any], folder: str, filename: str):
        """Create individual copy files with appropriate content"""
        try:
            content = ""
            
            if filename == "package.json":
                content = json.dumps({
                    "name": f"jarvis-copy-{metadata['name'].lower().replace(' ', '-')}",
                    "version": metadata["version"],
                    "description": f"J.A.R.V.I.S Copy - {metadata['name']}",
                    "main": "index.js",
                    "scripts": {
                        "dev": "vite",
                        "build": "vite build",
                        "start": "node server.js"
                    },
                    "jarvis_copy": {
                        "id": metadata["id"],
                        "creator": metadata["creator"],
                        "created": metadata["created"],
                        "type": metadata["type"]
                    }
                }, indent=2)
            
            elif filename == "settings.json":
                content = json.dumps({
                    "copy_id": metadata["id"],
                    "name": metadata["name"],
                    "version": metadata["version"],
                    "capabilities": metadata["capabilities"],
                    "restrictions": metadata["restrictions"],
                    "master_key": metadata["master_key"]
                }, indent=2)
            
            elif filename == "capabilities.json":
                content = json.dumps({
                    "enabled_features": metadata["capabilities"],
                    "disabled_features": metadata["restrictions"],
                    "api_endpoints": self._get_api_endpoints(metadata["type"]),
                    "ui_components": self._get_ui_components(metadata["type"])
                }, indent=2)
            
            elif filename == "README.md":
                content = f"""# J.A.R.V.I.S Copy - {metadata['name']}

## Overview
This is a J.A.R.V.I.S copy created on {metadata['created']} by {metadata['creator']}.

## Copy Information
- **Copy ID**: {metadata['id']}
- **Type**: {metadata['type']}
- **Version**: {metadata['version']}

## Capabilities
{chr(10).join(f"- {cap}" for cap in metadata['capabilities'])}

## Restrictions
{chr(10).join(f"- {restriction}" for restriction in metadata['restrictions'])}

## Installation
See INSTALLATION.md for setup instructions.

## Note
This copy operates independently but cannot access personal data, biometrics, or create additional copies.
"""
            
            elif filename == "INSTALLATION.md":
                content = """# Installation Guide

## Prerequisites
- Node.js 18+
- Python 3.8+

## Setup
1. Extract the package
2. Install dependencies: `npm install`
3. Start the system: `npm run dev`

## Configuration
Edit `config/settings.json` to customize behavior.

## Support
This is a standalone copy with limited support capabilities.
"""
            
            # Write content to file
            async with aiofiles.open(file_path, 'w') as f:
                await f.write(content)
                
        except Exception as e:
            logger.error(f"Failed to create copy file {file_path}: {e}")
    
    def _get_api_endpoints(self, copy_type: str) -> List[str]:
        """Get available API endpoints for copy type"""
        base_endpoints = ["/api/status", "/api/chat", "/api/help"]
        
        if copy_type in ["advanced", "enterprise"]:
            base_endpoints.extend(["/api/code", "/api/analyze", "/api/automate"])
        
        return base_endpoints
    
    def _get_ui_components(self, copy_type: str) -> List[str]:
        """Get available UI components for copy type"""
        base_components = ["ChatInterface", "StatusPanel", "HelpSystem"]
        
        if copy_type in ["advanced", "enterprise"]:
            base_components.extend(["CodeEditor", "DataVisualizer", "TaskManager"])
        
        return base_components
    
    async def _create_installer_package(self, copy_id: str, copy_dir: str) -> str:
        """Create installer package (ZIP file)"""
        try:
            package_path = os.path.join(self.output_dir, f"{copy_id}.jarvis")
            
            with zipfile.ZipFile(package_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(copy_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, copy_dir)
                        zipf.write(file_path, arcname)
            
            logger.info(f"Installer package created: {package_path}")
            return package_path
            
        except Exception as e:
            logger.error(f"Failed to create installer package: {e}")
            raise
    
    async def _generate_master_key(self):
        """Generate master key for copy control"""
        import secrets
        self.master_key = secrets.token_hex(32)
    
    async def _create_copy_templates(self):
        """Create copy templates for different types"""
        self.copy_templates = {
            "standard": {
                "name": "Standard Copy",
                "description": "Basic J.A.R.V.I.S functionality",
                "capabilities": ["nlp", "basic_automation"],
                "restrictions": ["no_personal_data", "no_replication"]
            },
            "advanced": {
                "name": "Advanced Copy",
                "description": "Enhanced capabilities with code generation",
                "capabilities": ["nlp", "automation", "code_generation"],
                "restrictions": ["no_personal_data", "no_replication"]
            },
            "enterprise": {
                "name": "Enterprise Copy",
                "description": "Full business capabilities",
                "capabilities": ["nlp", "automation", "code_generation", "team_collaboration"],
                "restrictions": ["no_personal_data", "no_replication", "audit_logging"]
            }
        }
    
    async def _load_copies(self):
        """Load existing copies from storage"""
        try:
            copies_file = os.path.join(self.copies_dir, "copies.json")
            if os.path.exists(copies_file):
                async with aiofiles.open(copies_file, 'r') as f:
                    content = await f.read()
                    self.copies = json.loads(content)
                logger.info(f"Loaded {len(self.copies)} copies")
            else:
                self.copies = {}
                logger.info("No existing copies found")
        except Exception as e:
            logger.error(f"Failed to load copies: {e}")
            self.copies = {}
    
    async def _save_copies(self):
        """Save copies to storage"""
        try:
            copies_file = os.path.join(self.copies_dir, "copies.json")
            async with aiofiles.open(copies_file, 'w') as f:
                content = json.dumps(self.copies, indent=2)
                await f.write(content)
            logger.info("Copies saved")
        except Exception as e:
            logger.error(f"Failed to save copies: {e}")
    
    async def get_copy_download_path(self, copy_id: str) -> str:
        """Get download path for a copy"""
        if copy_id in self.copies:
            package_path = os.path.join(self.output_dir, f"{copy_id}.jarvis")
            if os.path.exists(package_path):
                # Update download count
                self.copies[copy_id]["download_count"] = self.copies[copy_id].get("download_count", 0) + 1
                await self._save_copies()
                return package_path
        
        raise FileNotFoundError(f"Copy package not found: {copy_id}")
    
    async def disable_copy(self, copy_id: str) -> bool:
        """Disable a copy"""
        try:
            if copy_id in self.copies:
                self.copies[copy_id]["status"] = "disabled"
                self.copies[copy_id]["disabled_at"] = datetime.now().isoformat()
                await self._save_copies()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to disable copy: {e}")
            return False
    
    async def update_copy(self, copy_id: str) -> bool:
        """Update a copy with latest improvements"""
        try:
            if copy_id in self.copies:
                self.copies[copy_id]["last_update"] = datetime.now().isoformat()
                self.copies[copy_id]["update_count"] = self.copies[copy_id].get("update_count", 0) + 1
                
                # Rebuild package
                await self._build_copy_package(self.copies[copy_id])
                await self._save_copies()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to update copy: {e}")
            return False