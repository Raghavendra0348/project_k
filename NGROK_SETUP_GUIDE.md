# Ngrok Setup Guide - Share Your Localhost with ESP8266

This guide explains how to expose your local Firebase emulator and frontend through ngrok so your ESP8266 can access it from anywhere (local network or internet).

## Why Use ngrok?

- ✅ Access localhost from other devices (phones, ESP8266, etc.)
- ✅ Share your project with team members
- ✅ Test hardware on remote networks
- ✅ No port forwarding needed
- ✅ Secure HTTPS tunnels

---

## Prerequisites

1. **ngrok installed** (already in your project folder)
2. **Firebase emulator running**
3. **Frontend/Backend running**
4. **Active internet connection**

---

## Step 1: Download & Install ngrok

### Option A: Using npm (Recommended)

```bash
npm install -g ngrok
```

### Option B: Direct Download

```bash
# Linux/Mac
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Windows
# Download from https://ngrok.com/download and add to PATH
```

### Verify Installation

```bash
ngrok version
```

---

## Step 2: Get ngrok Authtoken (Optional but Recommended)

1. Sign up free at: https://ngrok.com
2. Get your authtoken from dashboard
3. Configure ngrok:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

Benefits:
- Higher bandwidth limits
- Custom subdomains (with paid plan)
- Longer session duration

---

## Step 3: Start Firebase Emulator

In **Terminal 1**, start the emulator:

```bash
firebase emulators:start
```

Output should show:
```
Firestore Emulator: http://localhost:8080
Functions Emulator: http://localhost:5001
Emulator UI: http://localhost:4000
```

---

## Step 4: Expose Ports with ngrok

### Option A: Expose Only Firestore (Recommended)

In **Terminal 2**:

```bash
ngrok http 8080
```

You'll see:
```
Forwarding                    https://abc123.ngrok.io -> http://localhost:8080
Web Interface                 http://127.0.0.1:4040
```

**Save this URL!** Example: `https://abc123.ngrok.io`

### Option B: Expose All Ports (Advanced)

Use `ngrok start` with config file:

```bash
# Create ngrok.yml in project root
cat > ngrok.yml << 'EOF'
authtoken: YOUR_AUTH_TOKEN
version: "3"
tunnels:
  firestore:
    proto: http
    addr: 8080
  api:
    proto: http
    addr: 5001
  frontend:
    proto: http
    addr: 3000
EOF

# Run all tunnels
ngrok start -c ngrok.yml firestore api frontend
```

---

## Step 5: Update ESP8266 Code

In **Terminal 3** (VS Code), update the Arduino file:

### Find and Replace These Lines:

**Line 47-48: Change from local IP to ngrok URL**

```cpp
// OLD
#define EMULATOR_HOST "10.211.191.164"
#define EMULATOR_FIRESTORE_PORT 8080

// NEW (replace abc123 with YOUR ngrok URL)
#define EMULATOR_HOST "abc123.ngrok.io"
#define EMULATOR_FIRESTORE_PORT 443
```

**Line 89-92: Change SSL setting for ngrok**

```cpp
// OLD
#if USE_EMULATOR
const char *fsHost = EMULATOR_HOST;
const int fsPort = EMULATOR_FIRESTORE_PORT;
const bool useSSL = false; // emulator = plain HTTP

// NEW
#if USE_EMULATOR
const char *fsHost = EMULATOR_HOST;
const int fsPort = EMULATOR_FIRESTORE_PORT;
const bool useSSL = true; // ngrok uses HTTPS
```

---

## Step 6: Start Frontend & Backend

In **Terminal 3**:

```bash
npm run dev
```

This starts:
- React Frontend (http://localhost:3000)
- Firebase Functions (http://localhost:5001)

---

## Step 7: Upload to ESP8266

1. Open Arduino IDE
2. Update the code with ngrok URL
3. Upload to ESP8266 board
4. Open Serial Monitor (115200 baud)

You should see:
```
=== ESP8266 Vending Machine ===
Setup done. Polling started.
Machine ID : machine-001
Emulator   : ON
Emulator at: abc123.ngrok.io:443
WiFi connecting................
WiFi OK!
Ready! Waiting orders...
```

---

## Complete Terminal Setup

```bash
# Terminal 1: Firebase Emulator
firebase emulators:start

# Terminal 2: ngrok (expose port 8080)
ngrok http 8080
# Save the URL: https://xxxxx.ngrok.io

# Terminal 3: Frontend + Backend
npm run dev

# Terminal 4: Arduino IDE
# Upload ESP8266 code with ngrok URL
# Then open Serial Monitor
```

---

## Testing the Connection

### From Browser (Desktop/Phone)

Visit the ngrok dashboard:
```
http://127.0.0.1:4040
```

This shows all requests flowing through ngrok.

### Test Firestore Query

```bash
curl https://abc123.ngrok.io/v1/projects/vending-machine-web/databases/\(default\)/documents/machines
```

Should return your machines data.

### Test ESP8266 Connection

Check Serial Monitor in Arduino IDE - should show:
```
--- Polling dispenseQueue ---
POST https://abc123.ngrok.io/v1/projects/...
HTTP 200
```

---

## Important: Every Restart Gets New URL

**Problem:** ngrok gives you a new URL each time you restart

**Solutions:**

### Option 1: Upgrade to Paid ngrok (Best)
- Custom domains ($12/month)
- No URL changes
- Higher limits

### Option 2: Use Static URL (Free Tier)
```bash
ngrok http 8080 --subdomain=my-vending-machine
# URL: https://my-vending-machine.ngrok.io (requires paid plan)
```

### Option 3: Create a Script (Workaround)

Create `get-ngrok-url.sh`:

```bash
#!/bin/bash
# Get ngrok URL and save it
URL=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url')
echo "Ngrok URL: $URL"
echo "Update your ESP8266 code with: ${URL#https://}"
```

Run it:
```bash
chmod +x get-ngrok-url.sh
./get-ngrok-url.sh
```

---

## Troubleshooting

### ngrok Not Found
```bash
# Make sure it's installed globally
npm install -g ngrok
# Or check it's in PATH
which ngrok
```

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```
**Solution:** Firebase emulator isn't running. Start it first:
```bash
firebase emulators:start
```

### SSL Certificate Error on ESP8266
```
[HTTPS] unable to connect
```
**Solution:** Ensure `useSSL = true` in the Arduino code when using ngrok

### Bandwidth Limit Exceeded
```
ERR_NGROK_126 - Tunnel bandwidth limit exceeded
```
**Solution:** 
- Free tier: 1GB/month
- Upgrade to paid plan
- Or use only during testing

### ESP8266 Still Can't Connect
1. Check WiFi is working
2. Verify ngrok URL is correct (no `https://`)
3. Verify port 443 works with ngrok
4. Test from phone browser first

---

## Advanced: Production Setup

For **production deployment** (Vercel + Firebase):

```cpp
// Use production Firebase instead of emulator
#define USE_EMULATOR false

// This will use firestore.googleapis.com directly
// No ngrok needed!
```

Then update environment variables:

```bash
# frontend/.env.production
REACT_APP_API_BASE_URL=https://your-deployed-api.com/api
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

---

## Security Notes

⚠️ **Important:**
- ngrok URLs are **public** - anyone with the URL can access your emulator
- Don't expose production databases through ngrok
- Use authentication if sharing URLs
- Regenerate API keys before deploying
- Use `--auth` flag for basic protection:

```bash
ngrok http 8080 --auth="username:password"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start ngrok | `ngrok http 8080` |
| View dashboard | `http://127.0.0.1:4040` |
| Stop ngrok | `Ctrl+C` |
| See current URL | Check Terminal 2 output |
| Test connection | `curl https://xxxxx.ngrok.io` |
| View logs | ngrok dashboard HTTP Inspector |

---

## Next Steps

1. ✅ Start Firebase emulator
2. ✅ Run ngrok in separate terminal
3. ✅ Copy ngrok URL
4. ✅ Update ESP8266 code
5. ✅ Upload to Arduino
6. ✅ Check Serial Monitor
7. ✅ Test order from frontend

---

## Support

- ngrok Docs: https://ngrok.com/docs
- Firebase Emulator: https://firebase.google.com/docs/emulator-suite
- ESP8266: https://esp8266.com/

---

## File Checklist

After setup, you should have:

```
project-root/
├── firebase.json              ✓
├── firestore.rules           ✓
├── NGROK_SETUP_GUIDE.md      ✓ (This file)
├── frontend/
│   ├── .env.local           ✓ (with ngrok URL)
│   └── ...
├── functions/
│   ├── .env.local           ✓
│   └── ...
├── esp8266/
│   └── esp8266_dispense.ino ✓ (with ngrok URL and useSSL=true)
└── ...
```

**You're all set!** 🎉
