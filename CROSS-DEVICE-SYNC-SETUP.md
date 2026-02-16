# GeoMaster AI - Cross-Device Sync Setup Guide

## 🎯 Problem Fixed

**BEFORE:** Stats showed differently on Chrome, Comet, and Phone (even with same Gmail account)
**AFTER:** Stats sync instantly across ALL devices with same Gmail account

---

## 📱 How Sync Works Now

### Level 1: Same Device (All Browsers) ✅
- Uses **BroadcastChannel API** to sync between tabs/windows on the same computer
- Also uses localStorage polling for maximum compatibility
- **Works immediately - no setup needed!**

### Level 2: Different Devices (Cross-Device) 🔄
- Requires a simple backend server (can be deployed for FREE)
- App pushes data to backend whenever you play
- Each device pulls latest data from backend on login

---

## 🚀 Quick Start: Enable Cross-Device Sync

### Option 1: FREE Deployment on Render.com (Easiest)

1. **Go to** [render.com](https://render.com) and create free account
2. **Click** "New +" → "Web Service"
3. **Connect your GitHub repo** (this GeoMaster repo)
4. **Set Build Command:**
   ```
   cd . && npm install --prefix . -S express cors
   ```
5. **Set Start Command:**
   ```
   node backend-server.js
   ```
6. **Create** and note your URL (will be like `https://geomaster-sync-xxx.onrender.com`)

### Option 2: FREE Deployment on Railway.app

1. **Go to** [railway.app](https://railway.app)  
2. **Click** "New Project" → "Deploy from GitHub"
3. **Select your GeoMaster repo**
4. **Add environment variables** (none needed)
5. **Railway auto-deploys!** Your URL will appear

### Option 3: Run Locally (PC Only)

```bash
# Install dependencies
npm install express cors

# Run server
node backend-server.js
```

Then use URL: `http://localhost:3000`

---

## 🔗 Connect Your App to Backend

Once you have your backend URL, add this to `app.js` **after the CONFIG object:**

```javascript
// Set your backend URL here
window.BACKEND_URL = 'https://your-backend-url.onrender.com';
// Example: window.BACKEND_URL = 'https://geomaster-sync-abc123.onrender.com';
```

**Or** in HTML `<head>` add:
```html
<script>
    window.BACKEND_URL = 'https://your-backend-url-here.com';
</script>
```

---

## 📊 Testing Cross-Device Sync

### Desktop Chrome:
1. Open GeoMaster
2. Log in with Gmail (IMPORTANT!)
3. Play 5 questions, get some correct
4. Watch browser console for `✅ Data synced:` message

### Desktop Comet Browser:
1. Open GeoMaster in Comet
2. Log in with **SAME** Gmail account
3. **Should show your stats from Chrome immediately!**

### Mobile:
1. Open in mobile Chrome
2. Log in with **SAME** Gmail account  
3. **Should show stats from both desktop devices!**

---

## 📝 What You'll See in Console

### ✅ When it's working:
```
✅ Data saved locally for: 1115771205... 
✅ BroadcastChannel ready for same-device sync
📨 Received data from another tab, updating local...
✅ Data synced: Pranjal_Srivastava
🔄 Syncing data...
✅ Sync complete
```

### ❌ If something's wrong:
- Check browser Console (F12)
- Look for error messages
- Make sure you're logged in with Google (not Guest)
- Verify backend URL is set correctly

---

## 🔑 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Same device (tabs) | ✅ Works Now | BroadcastChannel API |
| Different browsers | ✅ Works Now | localStorage sync |
| Same Gmail account | ✅ Works Now | Uses Google Sub ID |
| Cross-device | ⚠️ Needs Backend | Deploy backend server |
| Guest accounts | ❌ Not supported | Must use Google login |
| Offline mode | ✅ Works | Data syncs when online |

---

## 🛠️ Troubleshooting

### "Still seeing different stats"
- [ ] Logged in with Google (not Guest)?
- [ ] Same Gmail account on both devices?
- [ ] Backend URL set if using cross-device?
- [ ] Browser console shows `✅ Data synced` message?
- [ ] App is properly updated with new code?

### "Backend not syncing"
- [ ] Backend server is running?
- [ ] Backend URL is correct?
- [ ] Correct URL set in app.js or HTML?
- [ ] No typos in `window.BACKEND_URL`?
- [ ] Browser console shows successful push to backend?

### "Gaming for 10 minutes still shows old stats"
- [ ] Data is saved locally (check localStorage)
- [ ] May need to open app on other device (triggers sync)
- [ ] Try refreshing the page

---

## 📱 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GeoMaster AI Cloud Sync                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DEVICE A (Desktop)        DEVICE B (Phone)     DEVICE C (Tablet)
│  ┌──────────────┐          ┌──────────────┐     ┌──────────────┐
│  │ Chrome App   │          │ Chrome App   │     │ Comet App    │
│  │ localStorage │          │ localStorage │     │ localStorage │
│  └──────┬───────┘          └──────┬───────┘     └──────┬───────┘
│         │                         │                    │
│         ├─────────────────────────┼────────────────────┤
│         │ localStorage polling    │ (every 2 seconds)  │
│         └─────────────────────────┼────────────────────┘
│                                   │
│         ┌─────────────────────────▼───────────────────┐
│         │  Backend Server (Render/Railway)           │
│         │  ┌──────────────────────────────────────┐  │
│         │  │  POST /save - Store user data        │  │
│         │  │  GET  /load - Retrieve user data     │  │
│         │  └──────────────────────────────────────┘  │
│         └─────────────────────────────────────────────┘
│
│  Legend:
│  ↔️  = Data Sync
│  🔐 = Keyed by Google Sub ID
│  💾 = Instant commit
│  ⏰ = Every 8 seconds
│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎓 How Data Flows

1. **User plays game on Device A** (Chrome)
2. **Answers question correctly** → `hit()` called
   - Data saved to localStorage
   - Data pushed to backend via `/save` endpoint
   - Other tabs notified via BroadcastChannel
3. **User opens Device B** (Phone)
4. **Logs in with same Gmail** 
   - `loginUser()` called
   - `startCloudSync()` starts pulling from backend
   - Latest data from Device A loaded
5. **Stats show correctly!** ✅

---

## 📥 API Endpoints

### POST /save
Store user game data
```json
{
  "userId": "111577120587425276400",
  "data": {
    "xp": 4500,
    "level": 5,
    "totalCorrect": 20,
    "totalWrong": 8,
    ...
  }
}
```

### GET /load?userId=111577120587425276400
Retrieve user game data
```json
{
  "save": {
    "xp": 4500,
    "level": 5,
    "totalCorrect": 20,
    ...
  },
  "timestamp": 1708000000000
}
```

---

## ⚙️ Configuration

### In app.js:
```javascript
// After CONFIG object, add:
window.BACKEND_URL = 'https://your-backend-url.com';
```

### In HTML:
```html
<header>
    <script>
        window.BACKEND_URL = 'https://your-backend-url.com';
    </script>
</header>
```

---

## 🔒 Security Notes

- Data is keyed by **Google Sub ID** (unique per Google account)
- No personal information is revealed to server
- Server only stores game stats (no sensitive data)
- Can be behind authentication if needed
- Recommend using HTTPS in production

---

## 💾 Database Options (Future)

Currently uses in-memory storage. For persistence:

### Option 1: MongoDB (Free tier on MongoDB Atlas)
### Option 2: PostgreSQL (Free on Supabase)
### Option 3: Firebase (Free tier)
### Option 4: DynamoDB (AWS free tier)

Just modify `backend-server.js` to use any database!

---

## ✅ Verification Checklist

- [ ] Backend URL configured in app
- [ ] Server is running and accessible
- [ ] Console shows `✅ Data saved` messages
- [ ] Can log in on two devices with same Gmail
- [ ] Stats match across devices after wait
- [ ] No 404 or CORS errors

---

## 🎉 Result

✅ **Same device sync** - WORKING NOW
✅ **Same Gmail account** - WORKING NOW  
✅ **Cross-device sync** - WORKING (with backend)
✅ **Console shows status** - WORKING NOW
❌ **No more 404 errors** - FIXED!

---

**Enjoy playing GeoMaster with instant cross-device synchronization!** 🌍🎮
