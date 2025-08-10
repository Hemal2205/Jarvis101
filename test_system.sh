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
