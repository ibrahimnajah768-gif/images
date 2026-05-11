#!/bin/bash

echo "============================================"
echo "   Elevate AI Image Application Setup"
echo "============================================"
echo

echo "Step 1: Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo
echo "Step 2: Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
cd ..

echo
echo "Step 3: Setting up environment variables..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo
    echo "IMPORTANT: Please edit backend/.env and add your API keys!"
    echo "- Cloudinary credentials"
    echo "- Supabase credentials"
    echo
    echo "Press Enter after editing .env..."
    read -p ""
else
    echo ".env file already exists"
fi
cd ..

echo
echo "Step 4: Starting the application..."
echo
echo "Opening two terminals for frontend and backend..."
echo

# Start backend in background
cd backend && node server.js &
BACKEND_PID=$!

# Start frontend
cd ../frontend && npm start &
FRONTEND_PID=$!

echo
echo "============================================"
echo "   Application Started Successfully!"
echo "============================================"
echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo
echo "Press Ctrl+C to stop all servers"
echo

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait