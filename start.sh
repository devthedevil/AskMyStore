#!/bin/bash
# Start E-Commerce RAG Application
# Usage: ./start.sh

echo "=========================================="
echo "  E-Commerce RAG Assistant"
echo "  Single Agent RAG Application"
echo "=========================================="
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Create a .env file with: ANTHROPIC_API_KEY=your-key-here"
    exit 1
fi

# Start backend
echo "[1/2] Starting backend server on http://localhost:8000 ..."
cd "$(dirname "$0")"
python -m uvicorn backend.main:app --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "[2/2] Starting frontend on http://localhost:5173 ..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "  App is running!"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop both servers"

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
