# ✅ API URL Fix - Complete Solution

## The Problem

When deployed to Vercel, your app was getting this error:
```
Error fetching analytics: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

**Root cause:** All API calls like `fetch('/api/analytics/...')` were hitting **Vercel** instead of your **Render backend**, returning HTML 404 pages instead of JSON.

---

## The Solution

I implemented a **global fetch interceptor** that automatically routes all `/api/` calls to your Render backend in production.

### Files Modified:

1. **`frontend/src/utils/api.ts`** (NEW)
   - Smart URL handler
   - Detects environment (dev vs prod)
   - Prepends backend URL in production

2. **`frontend/src/main.tsx`** (UPDATED)
   - Overrides `window.fetch` globally
   - Intercepts all `/api/` calls
   - Routes them to correct backend

3. **`frontend/vercel.json`** (NEW)
   - Fixes SPA routing (404s on refresh)
   - Tells Vercel to serve `index.html` for all routes

---

## How It Works

### Development (localhost):
```javascript
fetch('/api/analytics/admin/1')
↓
'' + '/api/analytics/admin/1'
↓
Vite proxy → localhost:3002/api/analytics/admin/1 ✅
```

### Production (Vercel):
```javascript
fetch('/api/analytics/admin/1')
↓
'https://your-backend.onrender.com' + '/api/analytics/admin/1'
↓
https://your-backend.onrender.com/api/analytics/admin/1 ✅
```

**No code changes needed in your components!** All existing `fetch()` calls work automatically.

---

## Environment Variables Required

### Vercel (Frontend):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-backend.onrender.com
```

**Critical:** `VITE_API_URL` must be your full Render backend URL!

### Render (Backend):
```bash
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
VAPI_API_KEY=your_vapi_key
VAPI_PUBLIC_KEY=your_vapi_public_key
CORS_ORIGINS=https://your-frontend.vercel.app
LOG_LEVEL=warn
```

**Also Critical:** 
- `CORS_ORIGINS` must include your Vercel URL
- Start Command must be: `node dist/index.js`

---

## To Deploy These Fixes

### Step 1: Commit All Changes

```bash
git add .
git commit -m "fix: add API URL handling, Vercel SPA routing, and remove unused service key"
git push
```

### Step 2: Verify Vercel Environment Variable

1. Go to https://vercel.com
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Confirm `VITE_API_URL` is set to your Render backend URL
   - Example: `https://clozone-api.onrender.com`
   - Must include `https://`
   - NO trailing slash

### Step 3: Trigger Vercel Redeploy

- Vercel should auto-deploy from the push
- OR manually click **"Redeploy"** in Vercel dashboard
- Wait ~2 minutes

### Step 4: Verify Render Backend

1. Go to https://render.com
2. Check your web service is **"Live"**
3. Verify Start Command is: `node dist/index.js`
4. Check `CORS_ORIGINS` includes your Vercel URL

---

## Testing After Deployment

### 1. Check Frontend Loads:
```
https://your-app.vercel.app/ ✅
```

### 2. Check All Routes Work:
```
https://your-app.vercel.app/assignments ✅
https://your-app.vercel.app/analytics ✅
https://your-app.vercel.app/organization ✅
```

### 3. Check API Calls Work:

Open browser console (F12) and look for:
- **No CORS errors** ✅
- **No 404 errors** ✅
- **API responses are JSON** (not HTML) ✅

### 4. Test Full User Flow:
- [ ] Login works
- [ ] Can create/view assignments
- [ ] Analytics page loads data
- [ ] Can start training calls
- [ ] PDF export works

---

## Troubleshooting

### Still getting "<!doctype" errors?

**Check:**
1. `VITE_API_URL` is set in Vercel
2. Value is correct (your Render URL)
3. Vercel has redeployed since adding the variable
4. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)

**Verify:**
```bash
curl https://your-app.vercel.app/
# Look for: <script type="module" crossorigin src="/assets/index-*.js">
# The hash should be different after redeploy
```

### CORS errors?

**Check:**
1. Render backend is running (not sleeping)
2. `CORS_ORIGINS` in Render includes your Vercel URL
3. Both URLs use `https://`
4. No trailing slashes

**Test backend directly:**
```bash
curl https://your-backend.onrender.com/api/health
# Should return: {"status":"ok","environment":"production"}
```

### Still 404 on routes?

**Check:**
1. `vercel.json` is in `frontend/` folder (not root)
2. Vercel detected it (check deployment logs)
3. Clear browser cache
4. Try incognito/private mode

---

## What Changed vs Before

### Before (Broken):
```javascript
// In production:
fetch('/api/analytics/admin/1')
↓
https://your-app.vercel.app/api/analytics/admin/1
↓
404 HTML page (Vercel doesn't have this route)
↓
"Unexpected token '<'" error ❌
```

### After (Fixed):
```javascript
// In production:
fetch('/api/analytics/admin/1')
↓ (intercepted by our global fetch override)
https://your-backend.onrender.com/api/analytics/admin/1
↓
JSON response from Render
↓
Works perfectly! ✅
```

---

## Summary of All Fixes

1. ✅ **API URL routing** - All `/api/` calls go to Render
2. ✅ **SPA routing** - No more 404s on page refresh
3. ✅ **Removed service key** - Not needed in backend
4. ✅ **TypeScript types** - Moved to dependencies for Render build
5. ✅ **Start command** - Fixed to use `node dist/index.js`

---

## Cost Reminder

**Free Tier:**
- Render: $0/month (sleeps after 15 min, first request ~30s)
- Vercel: $0/month (always on)

**Recommended:**
- Render Starter: $7/month (always on, instant responses)
- Vercel: $0/month (Hobby tier)

---

**Everything should work now!** 🎉

Deploy, test, and you're live!

