# ⚡ Quick Deploy Checklist

Use this as a reference while deploying. See `DEPLOY_VERCEL_RENDER.md` for detailed instructions.

---

## 🔥 Backend (Render) - Deploy First

**1. Create Web Service:**
- Go to https://render.com
- New → Web Service
- Connect GitHub repo
- Select `Sales-Trainer`

**2. Configure:**
```
Name: clozone-api
Root Directory: backend
Build Command: npm install && npm run build
Start Command: node dist/index.js
```

**3. Environment Variables:**
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
OPENAI_API_KEY=...
VAPI_API_KEY=...
VAPI_PUBLIC_KEY=...
CORS_ORIGINS=https://your-frontend.vercel.app
LOG_LEVEL=warn
```

**4. Deploy & Get URL:**
- Click "Create Web Service"
- Wait ~3 minutes
- Copy your Render URL: `https://clozone-api.onrender.com`

**5. Test:**
```bash
curl https://your-render-url.onrender.com/api/health
```

---

## 🎨 Frontend (Vercel) - Deploy Second

**1. Create Project:**
- Go to https://vercel.com
- New Project → Import `Sales-Trainer`

**2. Configure:**
```
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

**3. Environment Variables:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-render-backend-url.onrender.com
```

**4. Deploy & Get URL:**
- Click "Deploy"
- Wait ~2 minutes
- Get your URL: `https://your-app.vercel.app`

---

## 🔄 Update Backend CORS - Critical!

**Go back to Render:**
1. Select your backend service
2. Environment tab
3. Update `CORS_ORIGINS`:
```
CORS_ORIGINS=https://your-app.vercel.app
```
4. Save (auto-redeploys)

---

## ✅ Test Everything

- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] Can sign up / log in
- [ ] Can start training session
- [ ] Analytics page works
- [ ] PDF export works

---

## 🚨 Common Issues

**CORS errors:**
- Check `CORS_ORIGINS` includes your Vercel URL
- Must include `https://`
- No trailing slash

**Backend slow:**
- Free tier sleeps after 15 min
- First request takes ~30 seconds
- Upgrade to Starter ($7/mo) for always-on

**Build fails:**
- Check logs in dashboard
- Verify all env vars are set
- No placeholder values

---

## 💰 Costs

**Free (with cold starts):** $0/month
**Recommended (always-on):** $7/month (Render Starter)

---

**Detailed instructions:** See `DEPLOY_VERCEL_RENDER.md`

