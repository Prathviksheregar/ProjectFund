#!/bin/bash

echo "🚀 PUBLIC FUND MANAGEMENT - SYSTEM STATUS"
echo "=========================================="

# Check if services are running
echo "📊 Service Status:"
DJANGO_PID=$(ps aux | grep "manage.py runserver" | grep -v grep | awk '{print $2}' | head -1)
NEXTJS_PID=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | head -1)

if [ ! -z "$DJANGO_PID" ]; then
    echo "   ✅ Django Backend: Running (PID: $DJANGO_PID)"
else
    echo "   ❌ Django Backend: Not running"
fi

if [ ! -z "$NEXTJS_PID" ]; then
    echo "   ✅ Next.js Frontend: Running (PID: $NEXTJS_PID)"
else
    echo "   ❌ Next.js Frontend: Not running"
fi

# Check port accessibility
echo
echo "🌐 Port Status:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "200"; then
    echo "   ✅ Backend API (Port 8000): Accessible"
else
    echo "   ❌ Backend API (Port 8000): Not accessible"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
    echo "   ✅ Frontend (Port 3000): Accessible"
else
    echo "   ❌ Frontend (Port 3000): Not accessible"
fi

# Check API endpoints
echo
echo "🔗 API Endpoints:"
if curl -s http://localhost:8000/api/dashboard/ | grep -q "stats"; then
    echo "   ✅ Dashboard API: Working"
else
    echo "   ❌ Dashboard API: Not working"
fi

if curl -s http://localhost:8000/api/sbt/ | grep -q "contract_address"; then
    echo "   ✅ SBT API: Working"
else
    echo "   ❌ SBT API: Not working"
fi

echo
echo "📱 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Django Admin: http://localhost:8000/admin/"
echo
echo "🔐 Admin Credentials:"
echo "   Django Admin - Username: admin, Password: admin123"
echo "   Blockchain Admin: 0x77A9880fc1637D02E988049c3057ddf9Fa43119b"
echo
echo "📋 Smart Contracts (Sepolia):"
echo "   SBT Token: 0x3F185534338d3cfC7E6D4597B74BE99e1FF9eC41"
echo "   Fund Management: 0x3A7C892248f9024d2Bfe9dE91A26C5F24e9E9641"
echo
echo "🎯 System is ready to use!"
