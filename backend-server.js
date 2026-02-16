const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage for name mappings: { googleId: "username" }
const nameMap = {};

// Store username
app.post('/name', (req, res) => {
    const { googleId, name } = req.body;
    if (!googleId || !name) {
        return res.status(400).json({ error: 'Missing googleId or name' });
    }
    nameMap[googleId] = name;
    console.log(`✅ Stored name for ${googleId}: ${name}`);
    res.json({ success: true });
});

// Retrieve username
app.get('/name/:googleId', (req, res) => {
    const { googleId } = req.params;
    const name = nameMap[googleId];
    if (name) {
        console.log(`✅ Retrieved name for ${googleId}: ${name}`);
        res.json({ name });
    } else {
        res.json({ name: null });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Name sync server running on http://localhost:${PORT}`);
    console.log(`📝 POST /name - Store name mapping`);
    console.log(`📖 GET /name/:googleId - Retrieve name mapping`);
});
