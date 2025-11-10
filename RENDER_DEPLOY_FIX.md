# ✅ Render Deployment - FIXED & READY

## What Was Wrong

Render's build was failing with TypeScript errors because:
- Type definitions (`@types/*`) were in `devDependencies`
- Render skips `devDependencies` during production builds
- TypeScript couldn't find type declarations for Express, CORS, React, etc.

## ✅ Fixed!

I moved all build-time dependencies to `dependencies`:
- `@types/express`
- `@types/cors`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `@types/multer`
- `@types/uuid`
- `typescript` (the compiler itself)

The build now passes locally and will work on Render!

---

## 🚀 Deploy to Render (Updated Instructions)

### Step 1: Push the Fix

```bash
git add backend/package.json
git commit -m "fix: move TypeScript deps to dependencies for Render build"
git push
```

### Step 2: Create Render Web Service

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select: `Sales-Trainer`

### Step 3: Configure

**Basic Settings:**
```
Name: clozone-api
Region: US West (or closest to you)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: node dist/index.js
Instance Type: Free (or Starter $7/mo for always-on)
```

### Step 4: Environment Variables

Click **"Advanced"** and add these one by one:

```bash
NODE_ENV=production

PORT=10000

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

OPENAI_API_KEY=your_openai_api_key

VAPI_API_KEY=your_vapi_api_key
VAPI_PUBLIC_KEY=your_vapi_public_key

CORS_ORIGINS=https://your-frontend-url.vercel.app
(You'll update this after deploying frontend)

LOG_LEVEL=warn
```

**Important:** Replace all `your_*` placeholders with actual values!

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build and deployment
3. Watch the logs - you should see:
   ```
   ==> Building...
   ==> Installing dependencies
   ==> Running 'npm run build'
   ==> Build successful! 
   ==> Starting server...
   ```

4. Once deployed, you'll get a URL like:
   ```
   https://clozone-api.onrender.com
   ```

### Step 6: Test Backend

```bash
curl https://your-render-url.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2024-..."
}
```

✅ **If you see this, backend is deployed successfully!**

---

## 🎨 Next: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import: `Sales-Trainer`
4. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

### Step 2: Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-render-backend-url.onrender.com
```

**Critical:** Use your Render backend URL from above!

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 1-3 minutes
3. Get your Vercel URL: `https://your-app.vercel.app`

---

## 🔄 Final Step: Update Backend CORS

**Go back to Render:**

1. Select your backend web service
2. Go to **"Environment"** tab
3. Edit `CORS_ORIGINS` to:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
4. Click **"Save Changes"**
5. Render will auto-redeploy (2 minutes)

---

## ✅ Verify Everything Works

### Backend Check:
```bash
curl https://your-render-url.onrender.com/api/health
```

### Frontend Check:
1. Open your Vercel URL in browser
2. Should see Clozone login page
3. Open browser console (F12) - no errors
4. Try signing up/logging in

### Full Test:
- [ ] Sign up / Log in
- [ ] Create organization
- [ ] Invite team member
- [ ] Start training session
- [ ] View analytics
- [ ] Export PDF

---

## 🐛 Troubleshooting

### Backend still failing to build?
- Check Render logs for specific errors
- Verify all env vars are set (no `your_*` placeholders)
- Make sure you pushed the package.json changes

### Frontend can't reach backend?
- Verify `VITE_API_URL` is correct
- Check `CORS_ORIGINS` includes your Vercel URL
- Both must use `https://`
- No trailing slashes

### Backend responding slowly?
- Free tier sleeps after 15 min of inactivity
- First request takes ~30 seconds to wake up
- Upgrade to Starter ($7/mo) for always-on

---

## 💰 Costs

**Free Tier:** $0/month
- Backend sleeps after 15 min
- 750 hours/month on Render
- Unlimited on Vercel

**Recommended:** $7/month
- Render Starter (always-on backend)
- Vercel Free (frontend)
- No cold starts

---

## 🎉 Success!

Once both are deployed and CORS is updated:

✅ Backend health check passes
✅ Frontend loads without errors
✅ Users can sign up and log in
✅ API calls work (check Network tab)
✅ All features functional

**You're live!** 🚀

