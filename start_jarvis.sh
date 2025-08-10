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
