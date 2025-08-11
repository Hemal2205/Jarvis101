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
