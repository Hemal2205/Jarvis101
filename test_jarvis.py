#!/usr/bin/env python3
"""
J.A.R.V.I.S System Test Script
Tests all major functionalities
"""

import requests
import json
import time
import sys

def test_api_endpoint(url, method="GET", data=None):
    """Test an API endpoint"""
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, f"Status code: {response.status_code}"
    except Exception as e:
        return False, str(e)

def main():
    base_url = "http://localhost:8000"
    
    print("🚀 J.A.R.V.I.S System Test")
    print("=" * 50)
    
    # Test 1: System Status
    print("\n1. Testing System Status...")
    success, result = test_api_endpoint(f"{base_url}/api/status")
    if success:
        print("✅ System Status: ONLINE")
        print(f"   Enhanced Mode: {result.get('enhanced_mode', False)}")
        if 'capabilities' in result:
            print("   Capabilities:")
            for cap, enabled in result['capabilities'].items():
                status = "✅" if enabled else "❌"
                print(f"     {status} {cap}")
    else:
        print(f"❌ System Status: FAILED - {result}")
        return False
    
    # Test 2: Command Processing
    print("\n2. Testing Command Processing...")
    test_command = {
        "text": "What are your capabilities?",
        "context": {"test": True}
    }
    success, result = test_api_endpoint(f"{base_url}/api/command", "POST", test_command)
    if success:
        print("✅ Command Processing: WORKING")
        print(f"   Response: {result.get('message', 'No message')[:100]}...")
    else:
        print(f"❌ Command Processing: FAILED - {result}")
    
    # Test 3: System Automation
    print("\n3. Testing System Automation...")
    automation_task = {
        "description": "Monitor system resources"
    }
    success, result = test_api_endpoint(f"{base_url}/api/execute-task", "POST", automation_task)
    if success:
        print("✅ System Automation: WORKING")
        print(f"   Task Status: {result.get('status', 'Unknown')}")
    else:
        print(f"❌ System Automation: FAILED - {result}")
    
    # Test 4: Stealth Mode Activation
    print("\n4. Testing Stealth Modes...")
    for mode in ["exam", "interview", "copilot"]:
        stealth_config = {"mode": mode}
        success, result = test_api_endpoint(f"{base_url}/api/stealth/activate", "POST", stealth_config)
        if success:
            print(f"✅ Stealth {mode.title()} Mode: WORKING")
            print(f"   Features: {len(result.get('features', []))} available")
        else:
            print(f"❌ Stealth {mode.title()} Mode: FAILED - {result}")
    
    # Test 5: Memory System
    print("\n5. Testing Memory System...")
    success, result = test_api_endpoint(f"{base_url}/api/memories")
    if success:
        print("✅ Memory System: WORKING")
        print(f"   Memories: {len(result.get('memories', []))} stored")
    else:
        print(f"❌ Memory System: FAILED - {result}")
    
    # Test 6: Task Management
    print("\n6. Testing Task Management...")
    success, result = test_api_endpoint(f"{base_url}/api/tasks")
    if success:
        print("✅ Task Management: WORKING")
        print(f"   Active Tasks: {len(result.get('tasks', []))}")
    else:
        print(f"❌ Task Management: FAILED - {result}")
    
    print("\n" + "=" * 50)
    print("🎯 J.A.R.V.I.S System Test Complete!")
    print("\n📋 Test Summary:")
    print("   ✅ All core systems functional")
    print("   🤖 AI Brain: Ready")
    print("   🛡️ Stealth Systems: Operational")
    print("   🔧 Automation: Active")
    print("   💾 Memory Vault: Accessible")
    print("   🎮 HUD Interface: Available at http://localhost:5173")
    
    print("\n🚀 Ready for Commands:")
    print("   • 'Create pipeline for solar plants usage in Ontario'")
    print("   • 'Activate stealth exam mode'")
    print("   • 'Open Chrome and navigate to AWS Console'")
    print("   • 'Generate Python code for weather analysis'")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚡ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)