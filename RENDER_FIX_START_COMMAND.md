# 🔧 Render Start Command Fix

## The Error

```
bash: line 1: dist/index.js: Permission denied
==> Exited with status 126
```

This means Render is trying to execute `dist/index.js` directly as a shell script, which doesn't work for JavaScript files.

---

## ✅ The Fix

You need to prefix the start command with `node`:

**Wrong:**
```
dist/index.js
```

**Correct:**
```
node dist/index.js
```

---

## 📝 How to Fix in Render Dashboard

### Step 1: Go to Settings
1. Log in to https://render.com
2. Select your web service (clozone-api or whatever you named it)
3. Click **"Settings"** in the left sidebar

### Step 2: Update Start Command
1. Scroll down to **"Build & Deploy"** section
2. Find the **"Start Command"** field
3. Change it from `dist/index.js` to:
   ```
   node dist/index.js
   ```
4. Click **"Save Changes"** button at the bottom

### Step 3: Redeploy
1. Go back to the main dashboard for your service
2. Click **"Manual Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. Wait 2-3 minutes for deployment

---

## ✅ Verify It Works

Once deployed, check the logs. You should see:

```
==> Running 'node dist/index.js'
🔧 Environment Configuration:
   Environment: production
   Port: 10000
   ...
============================================================
🚀 Clozone API Server - PRODUCTION
============================================================
   Server: http://localhost:10000
   Health: http://localhost:10000/api/health
   Status: Ready to accept requests
============================================================
```

Then test the health endpoint:
```bash
curl https://your-render-url.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2024-..."
}
```

---

## 🎯 Complete Render Configuration

For reference, here are ALL the correct settings:

**Build & Deploy:**
```
Build Command: npm install && npm run build
Start Command: node dist/index.js
```

**Environment:**
```
Root Directory: backend
```

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_key
OPENAI_API_KEY=your_key
VAPI_API_KEY=your_key
VAPI_PUBLIC_KEY=your_key
CORS_ORIGINS=https://your-frontend.vercel.app
LOG_LEVEL=warn
```

---

## 🐛 If Still Not Working

### Check the Logs:
1. In Render dashboard, click **"Logs"** tab
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Wrong environment variable values
   - Port conflicts (should be 10000)

### Verify Build Succeeded:
In logs, you should see:
```
==> Building...
==> Installing dependencies
==> Running 'npm run build'
✓ Built successfully
```

If build fails, check that you pushed the latest `package.json` changes.

---

## 💡 Why This Happens

JavaScript files (`.js`) are not executable on their own. They need to be run by Node.js.

When you use `node dist/index.js`, you're telling the system:
- "Hey Node.js (`node`), run this file (`dist/index.js`)"

When you use just `dist/index.js`, the system tries to execute it directly:
- "Hey Linux, run this file" → Permission denied! (It's not a binary)

---

**That's it! Change the start command and redeploy. Should work now!** ✅

