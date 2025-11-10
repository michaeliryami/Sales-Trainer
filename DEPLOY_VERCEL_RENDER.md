# 🚀 Deployment Guide: Vercel + Render

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed
- [ ] Vercel account (free tier works)
- [ ] Render account (free tier works)
- [ ] Supabase project URL and keys
- [ ] OpenAI API key
- [ ] VAPI API key and public key
- [ ] New OpenAI API key (if the old one was exposed to Git)

---

## 🔥 Part 1: Deploy Backend to Render (Do This First!)

### Step 1: Create Render Account & New Web Service

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `Sales-Trainer`

### Step 2: Configure Web Service

**Basic Settings:**
- **Name:** `clozone-api` (or your choice)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/index.js`
- **Instance Type:** Choose plan (Free tier available)

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** for each:

**Required Variables:**
```
NODE_ENV = production

PORT = 10000

SUPABASE_URL = your_supabase_project_url
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_KEY = your_supabase_service_role_key

OPENAI_API_KEY = your_openai_api_key

VAPI_API_KEY = your_vapi_api_key
VAPI_PUBLIC_KEY = your_vapi_public_key

CORS_ORIGINS = https://app.clozone.ai,https://clozone.ai
(Update with your actual Vercel URLs after frontend deployment)

LOG_LEVEL = warn
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Keep your Supabase service key secure - it has admin access
- You'll update `CORS_ORIGINS` after deploying the frontend

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://clozone-api.onrender.com`
4. **Save this URL** - you'll need it for frontend deployment

### Step 5: Verify Backend Deployment

Test your backend:
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

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account & Import Project

1. Go to https://vercel.com and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Sales-Trainer`
4. Select the repository

### Step 2: Configure Project Settings

**Framework Preset:** Vite
**Root Directory:** `frontend`

**Build & Development Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_API_URL = https://your-render-backend-url.onrender.com
```

**Important:**
- Use the Render backend URL from Part 1, Step 4
- Include `https://` in the API URL
- Make sure there's NO trailing slash

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (usually 1-3 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

### Step 5: Configure Custom Domain (Optional)

If you have a custom domain:

1. In Vercel dashboard, go to **"Settings"** → **"Domains"**
2. Add your domain (e.g., `app.clozone.ai`)
3. Follow Vercel's instructions to configure DNS
4. Wait for SSL certificate (automatic, ~1-2 minutes)

---

## 🔄 Part 3: Update Backend CORS (Critical!)

Now that you have your frontend URL, update the backend:

### Step 3.1: Update CORS in Render

1. Go back to your Render dashboard
2. Select your backend web service
3. Go to **"Environment"** tab
4. Update **`CORS_ORIGINS`** to include your Vercel URLs:

```
CORS_ORIGINS = https://your-app.vercel.app,https://app.clozone.ai
```

**Examples:**
- If using Vercel default: `https://sales-trainer.vercel.app`
- If using custom domain: `https://app.clozone.ai`
- Multiple domains: `https://app.clozone.ai,https://clozone.ai`

5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## 🧪 Part 4: Test Your Deployment

### Test Checklist:

1. **Backend Health Check:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok","environment":"production"}`

2. **Frontend Loads:**
   - Visit your Vercel URL
   - Should see the Clozone login page
   - No console errors about API connection

3. **User Flow Test:**
   - [ ] Create a new account
   - [ ] Verify email (if enabled)
   - [ ] Login successfully
   - [ ] Create an organization (admin)
   - [ ] Invite a team member
   - [ ] Start a training session
   - [ ] View analytics
   - [ ] Export a PDF report

4. **Check Console for Warnings:**
   - Open browser DevTools (F12)
   - Look for CORS errors (should be none)
   - Check Network tab - API calls should succeed

---

## 🎯 Part 5: Landing Page (Optional)

If you want to deploy the landing page to Vercel:

### Step 5.1: Create Separate Vercel Project

1. In Vercel, click **"Add New..."** → **"Project"**
2. Import the same repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `landing`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. No environment variables needed for landing page
5. Deploy to your root domain (e.g., `clozone.ai`)

---

## 🔧 Troubleshooting

### Backend Issues

**"Module not found" errors:**
- Check that `package.json` includes all dependencies
- Render should run `npm install` automatically
- Verify `Build Command` is: `npm install && npm run build`

**"Port already in use":**
- Don't worry! Render assigns the port dynamically
- Your code uses `process.env.PORT || 3002` which handles this

**Backend takes long to respond:**
- Free tier Render instances sleep after inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid plan for always-on instance

### Frontend Issues

**"Failed to fetch" or CORS errors:**
- Check `VITE_API_URL` in Vercel environment variables
- Ensure backend `CORS_ORIGINS` includes your Vercel URL
- Both URLs must include `https://`
- No trailing slashes

**Environment variables not working:**
- In Vercel, must start with `VITE_`
- Redeploy after adding/changing env vars
- Clear browser cache

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify `package.json` has all dependencies
- May need to increase build timeout in settings

### Database Issues

**"Could not connect to Supabase":**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Test connection from your deployed URL

**RLS (Row Level Security) errors:**
- Ensure RLS policies are set up in Supabase
- Service key bypasses RLS (backend)
- Anon key respects RLS (frontend)

---

## 📱 Part 6: Configure Render Custom Domain (Optional)

If you want your API at `api.clozone.ai`:

1. In Render dashboard, go to your web service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain: `api.clozone.ai`
4. Add the CNAME record to your DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: `clozone-api.onrender.com` (your Render subdomain)
5. Wait for DNS propagation (5-30 minutes)
6. Render will automatically provision SSL certificate

Then update frontend `VITE_API_URL` to `https://api.clozone.ai`

---

## 🔄 Part 7: Continuous Deployment

Both Vercel and Render support automatic deployments:

**Automatic Deployments:**
- Every push to `main` branch triggers a new deployment
- Both platforms build and deploy automatically
- Vercel: ~1-3 minutes
- Render: ~2-5 minutes

**Preview Deployments (Vercel):**
- Every pull request gets a preview URL
- Test changes before merging to main
- Automatically created by Vercel

**To disable auto-deploy:**
- Render: Settings → Build & Deploy → Toggle off
- Vercel: Project Settings → Git → Toggle off

---

## 📊 Part 8: Monitoring & Logs

### Render Logs

1. Go to your Render dashboard
2. Select your web service
3. Click **"Logs"** tab
4. Real-time logs of your backend
5. Filter by time range or search

### Vercel Logs

1. Go to your Vercel dashboard
2. Select your project
3. Click **"Deployments"**
4. Click any deployment → **"Logs"**
5. Build logs and runtime logs available

### Set Up Monitoring

**For Render:**
- Free tier includes basic metrics
- Upgrade for advanced monitoring

**For Vercel:**
- Analytics built-in (pageviews, etc.)
- Add Vercel Analytics for real-user monitoring

---

## 💰 Cost Breakdown

### Free Tier Limits

**Render (Free):**
- ✅ 750 hours/month
- ✅ Automatic SSL
- ⚠️ Sleeps after 15 min of inactivity
- ⚠️ 100 GB bandwidth/month
- **Recommended:** Upgrade to Starter ($7/mo) for always-on

**Vercel (Free/Hobby):**
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ 100 GB bandwidth/month
- ✅ Always-on
- ✅ Perfect for production

**Total Monthly Cost:**
- **Free tier:** $0 (with cold starts on backend)
- **Recommended:** $7/mo (Render Starter + Vercel Free)

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Backend health check responds at your Render URL
- ✅ Frontend loads at your Vercel URL
- ✅ Users can sign up and log in
- ✅ No CORS errors in browser console
- ✅ API calls succeed (check Network tab)
- ✅ Training sessions can be created and started
- ✅ Analytics page loads with data
- ✅ PDF exports work correctly

---

## 🆘 Need Help?

**Render Documentation:**
- https://render.com/docs
- Support: https://render.com/support

**Vercel Documentation:**
- https://vercel.com/docs
- Support: https://vercel.com/support

**Common Issues:**
- Check this guide's Troubleshooting section
- Review deployment logs (both platforms)
- Verify all environment variables are set correctly
- Ensure CORS is configured with correct URLs

---

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] Test all user flows
- [ ] Verify PDF generation works
- [ ] Check analytics page loads
- [ ] Test invite system
- [ ] Verify VAPI calls work
- [ ] Test from different devices/browsers
- [ ] Set up custom domains (optional)
- [ ] Configure monitoring/alerts
- [ ] Update `CORS_ORIGINS` with final URLs
- [ ] Rotate OpenAI API key if exposed
- [ ] Document your deployment URLs
- [ ] Create backup of environment variables
- [ ] Test with real users from your org

---

**🎊 Congratulations! Your Clozone app is now live!**

