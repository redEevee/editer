#!/bin/bash
# Instagram Feed Generator - Start Script
# Starts both backend and frontend dev servers

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Instagram Feed Generator..."
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend
cd "$ROOT_DIR/backend" && node server.js &
BACKEND_PID=$!

# Start frontend
cd "$ROOT_DIR/frontend" && npx vite &
FRONTEND_PID=$!

# Wait and handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
