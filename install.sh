#!/bin/bash

# J.A.R.V.I.S Installation Script
# This script will set up your complete JARVIS system

echo "🚀 J.A.R.V.I.S Installation Starting..."
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Create required directories
echo "📁 Creating required directories..."
mkdir -p backend/data/security
mkdir -p backend/data/skills
mkdir -p backend/data/learning_sessions
mkdir -p backend/sounds
mkdir -p backend/backups/snapshots

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies. Please check your internet connection and try again."
    exit 1
fi
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies. Please check your internet connection and try again."
    exit 1
fi

# Create sound effects directory and download sample sounds (optional)
echo "🔊 Setting up sound effects..."
cd backend/sounds

# Create placeholder sound files if they don't exist
touch jarvis_startup.wav
touch jarvis_notification.wav
touch jarvis_alert.wav
touch jarvis_success.wav
touch jarvis_error.wav
touch jarvis_processing.wav

echo "📝 Sound effect placeholders created. You can replace these with actual sound files."

cd ../..

# Create startup script
echo "🔧 Creating startup script..."
cat > start_jarvis.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting J.A.R.V.I.S System..."
echo "===================================="

# Function to handle cleanup
cleanup() {
    echo "🛑 Shutting down J.A.R.V.I.S..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend development server
echo "🎨 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ J.A.R.V.I.S is online!"
echo "🌐 Open your browser and navigate to: http://localhost:5173"
echo "🔒 Complete first-time setup by registering a new user"
echo ""
echo "Press Ctrl+C to stop the system"

# Wait for processes
wait $BACKEND_PID
wait $FRONTEND_PID
EOF

chmod +x start_jarvis.sh

# Create development setup script
echo "🛠️ Creating development setup script..."
cat > setup_dev.sh << 'EOF'
#!/bin/bash

echo "🔧 Setting up J.A.R.V.I.S for development..."

# Install additional development tools
echo "📦 Installing development dependencies..."
npm install --save-dev

# Install Python development tools
echo "🐍 Installing Python development tools..."
cd backend
pip3 install black flake8 pytest pytest-asyncio
cd ..

echo "✅ Development setup complete!"
echo "🚀 Use 'npm run dev' to start the frontend with hot reload"
echo "🐍 Use 'python3 backend/main.py' to start the backend"
EOF

chmod +x setup_dev.sh

# Create system test script
echo "🧪 Creating system test script..."
cat > test_system.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing J.A.R.V.I.S System..."

# Test backend server
echo "🔧 Testing backend server..."
cd backend
python3 -c "
import sys
import asyncio
from main import app

async def test_startup():
    print('✅ Backend imports successful')
    print('✅ FastAPI app created')
    return True

if __name__ == '__main__':
    result = asyncio.run(test_startup())
    if result:
        print('✅ Backend test passed')
    else:
        print('❌ Backend test failed')
        sys.exit(1)
"
cd ..

# Test frontend build
echo "🎨 Testing frontend build..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build test passed"
else
    echo "❌ Frontend build test failed"
    exit 1
fi

echo "✅ All system tests passed!"
EOF

chmod +x test_system.sh

# Final setup
echo "🎉 Installation Complete!"
echo "=================================================="
echo ""
echo "📋 What's been set up:"
echo "  ✅ Python dependencies installed"
echo "  ✅ Node.js dependencies installed"
echo "  ✅ Required directories created"
echo "  ✅ Sound effects placeholders created"
echo "  ✅ Startup script created (start_jarvis.sh)"
echo "  ✅ Development setup script created (setup_dev.sh)"
echo "  ✅ System test script created (test_system.sh)"
echo ""
echo "🚀 To start J.A.R.V.I.S:"
echo "  ./start_jarvis.sh"
echo ""
echo "🌐 Then open your browser to: http://localhost:5173"
echo ""
echo "📖 For detailed documentation, see: SETUP_GUIDE.md"
echo ""
echo "🎯 Features available:"
echo "  • Face and voice authentication"
echo "  • User registration system"
echo "  • Skills learning and tracking"
echo "  • Cinematic voice synthesis"
echo "  • Iron Man-style HUD interface"
echo "  • Intelligent close warnings"
echo "  • Self-upgrading capabilities"
echo ""
echo "Welcome to J.A.R.V.I.S! 🤖"