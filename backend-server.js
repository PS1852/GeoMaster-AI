// =====================================================================
//  GeoMaster AI - Simple Cloud Sync Backend Server
//  Deploy this to Render.com or Railway.app for FREE cross-device sync
// =====================================================================

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store (data persists while server is running)
// For production, use a database like MongoDB
let userSaves = {};

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'GeoMaster Sync Server is running' });
});

// Save user data
app.post('/save', (req, res) => {
    const { userId, data } = req.body;
    
    if (!userId || !data) {
        return res.status(400).json({ error: 'Missing userId or data' });
    }
    
    // Store the data
    userSaves[userId] = {
        data: data,
        timestamp: Date.now(),
        updatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Saved data for user: ${userId}`);
    res.json({ success: true, message: 'Data saved', timestamp: userSaves[userId].timestamp });
});

// Load user data
app.get('/load', (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }
    
    const savedData = userSaves[userId];
    
    if (!savedData) {
        console.log(`ℹ️ No data found for user: ${userId}`);
        return res.json({ save: null, message: 'No data found' });
    }
    
    console.log(`✅ Loaded data for user: ${userId}`);
    res.json({ save: savedData.data, timestamp: savedData.timestamp });
});

// Get all users (admin endpoint - optional)
app.get('/admin/users', (req, res) => {
    const userCount = Object.keys(userSaves).length;
    res.json({ 
        totalUsers: userCount,
        message: `${userCount} users have synced data`
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 GeoMaster Cloud Sync Server running on port ${PORT}`);
    console.log(`📍 Base URL: http://localhost:${PORT}`);
    console.log(`💾 Store data: POST /save with { userId, data }`);
    console.log(`📥 Load data: GET /load?userId=...`);
});
