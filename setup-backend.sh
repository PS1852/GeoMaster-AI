#!/bin/bash
# GeoMaster AI - Backend URL Configuration Script
# Run this script to add your backend URL to the app

echo "🌍 GeoMaster AI - Cross-Device Sync Setup"
echo "=========================================="
echo ""
echo "Do you have a backend server running?"
echo "  1) Yes, I deployed it on Render.com or Railway.app"
echo "  2) No, I want to run it locally"
echo "  3) No, I'll skip backend (same-device sync only)"
echo ""
read -p "Choose (1-3): " choice

case $choice in
  1)
    read -p "Enter your backend URL (e.g. https://geomaster-sync-xxx.onrender.com): " backend_url
    
    # Add to app.js after CONFIG definition
    if grep -q "window.BACKEND_URL" app.js; then
      echo "Backend URL already configured!"
    else
      echo "Adding backend URL to app.js..."
      echo "window.BACKEND_URL = '$backend_url';" >> app.js
      echo "✅ Backend URL added!"
    fi
    ;;
  2)
    echo "To run backend locally:"
    echo "  1. npm install"
    echo "  2. node backend-server.js"
    echo "  3. Set in app.js: window.BACKEND_URL = 'http://localhost:3000';"
    ;;
  3)
    echo "⚠️  Same-device sync only (BroadcastChannel API)"
    echo "Stats will sync between tabs on same computer"
    echo "To enable cross-device sync, deploy backend anytime!"
    ;;
esac

echo ""
echo "📖 See CROSS-DEVICE-SYNC-SETUP.md for more details"
