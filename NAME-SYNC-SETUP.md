# Setup: Cross-Device Name Sync

Your app now syncs usernames across devices using a simple backend server.

## How It Works

- **Same device, different browsers**: Chrome ↔ Firefox (instant via BroadcastChannel)
- **Different devices**: PC ↔ Phone (synced via backend server)
- **Stats**: Each device has its own stats (separate localStorage)
- **Google login**: Same account, different or same username

## Running the Backend

### 1. Install Node.js (if not already installed)
Download from https://nodejs.org/ (LTS version recommended)

### 2. Install Dependencies
```bash
cd GeoMaster-AI
npm install
```

### 3. Start the Server
```bash
npm start
```

You should see:
```
🚀 Name sync server running on http://localhost:3000
```

### 4. Configure Your App

Add this line to `index.html` **before** the `<script src="app.js"></script>` tag:

```html
<script>
    window.NAME_SYNC_URL = 'http://localhost:3000';
</script>
```

### 5. Test It

1. Open Chrome, login with Google, change name to "ChromeAgent"
2. Open Firefox same PC, login with same Google account → should show "ChromeAgent"
3. Open Chrome on Phone, login same Google → will start blank (separate device)
4. Change name on Phone to "PhoneAgent" → syncs to backend
5. Go back to Desktop Chrome, refresh → still shows "ChromeAgent" (different device, different name)

## Stopping the Server

Press `Ctrl + C` in the terminal

## Notes

- Backend runs in-memory (data lost when restarted)
- For cross-device sync, keep the server running 24/7
- If backend is down, app works normally but names don't sync across devices
- Add `window.NAME_SYNC_URL` before app.js loads for it to work
