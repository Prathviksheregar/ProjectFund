#!/bin/bash

echo "🚀 Starting Public Fund Management System..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project directory
cd /home/vikas/Desktop/Public-Fund-Management

echo -e "${BLUE}📁 Current directory: $(pwd)${NC}"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: backend/.env file not found!${NC}"
    echo -e "${BLUE}📝 Please create backend/.env file with your API keys${NC}"
    echo -e "${BLUE}💡 You can copy from backend/.env.example${NC}"
    exit 1
fi

# Function to start backend
start_backend() {
    echo -e "${GREEN}🐍 Starting Django Backend...${NC}"
    cd backend
    source ../.venv/bin/activate
    python manage.py runserver 0.0.0.0:8000 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo -e "${GREEN}⚛️  Starting Next.js Frontend...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
    cd ..
}

# Start services
start_backend
sleep 3
start_frontend

echo ""
echo -e "${GREEN}🎉 Public Fund Management System is starting...${NC}"
echo ""
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔗 Backend API: http://localhost:8000${NC}"
echo -e "${BLUE}⚙️  Admin Panel: http://localhost:8000/admin${NC}"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all services${NC}"

# Wait for user input to stop
wait
