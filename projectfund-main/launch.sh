#!/bin/bash

echo "🚀 STARTING PUBLIC FUND MANAGEMENT SYSTEM"
echo "=========================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "manage.py runserver" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Start Django Backend
echo "🔧 Starting Django Backend..."
cd /home/vikas/Desktop/Public-Fund-Management/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!
echo "   ✅ Django started (PID: $DJANGO_PID)"

# Wait for Django to start
sleep 3

# Start Next.js Frontend
echo "🌐 Starting Next.js Frontend..."
cd /home/vikas/Desktop/Public-Fund-Management/frontend
npm run dev &
NEXTJS_PID=$!
echo "   ✅ Next.js started (PID: $NEXTJS_PID)"

# Wait for services to initialize
echo "⏳ Waiting for services to initialize..."
sleep 5

# Display status
echo
echo "🎯 SYSTEM READY!"
echo "===================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "⚙️  Django Admin: http://localhost:8000/admin/"
echo
echo "🔐 CREDENTIALS:"
echo "   Django Admin: admin / admin123"
echo "   Blockchain Admin: 0x77A9880fc1637D02E988049c3057ddf9Fa43119b"
echo
echo "📋 SMART CONTRACTS (Sepolia):"
echo "   SBT Token: 0x3F185534338d3cfC7E6D4597B74BE99e1FF9eC41"
echo "   Fund Management: 0x3A7C892248f9024d2Bfe9dE91A26C5F24e9E9641"
echo
echo "💡 PERFORMANCE OPTIMIZATIONS APPLIED:"
echo "   - Optimized Next.js configuration"
echo "   - Enhanced webpack bundling"
echo "   - Reduced compilation time"
echo "   - Improved memory usage"
echo
echo "🎮 TO STOP: Press Ctrl+C or run: pkill -f 'manage.py runserver'; pkill -f 'next dev'"
echo
echo "📊 Monitor logs in separate terminals:"
echo "   Backend logs: tail -f /tmp/django.log"
echo "   Frontend logs: Check this terminal output"

# Keep script running to monitor
echo "🔄 System running... Press Ctrl+C to stop all services"
trap "echo '🛑 Stopping services...'; kill $DJANGO_PID $NEXTJS_PID 2>/dev/null; exit 0" INT
wait
