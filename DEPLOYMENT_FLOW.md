# 🔄 Deployment Flow Diagram

## Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: DEPLOY BACKEND TO RENDER (5-10 mins)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Create Render Account                                  │
│     └─> render.com                                         │
│                                                             │
│  2. New Web Service                                        │
│     ├─> Connect GitHub                                     │
│     ├─> Select: Sales-Trainer                             │
│     └─> Root Directory: backend                           │
│                                                             │
│  3. Configure Build                                        │
│     ├─> Build: npm install && npm run build               │
│     └─> Start: node dist/index.js                         │
│                                                             │
│  4. Set Environment Variables                              │
│     ├─> NODE_ENV=production                               │
│     ├─> SUPABASE_URL=...                                  │
│     ├─> SUPABASE_ANON_KEY=...                             │
│     ├─> SUPABASE_SERVICE_KEY=...                          │
│     ├─> OPENAI_API_KEY=...                                │
│     ├─> VAPI_API_KEY=...                                  │
│     ├─> VAPI_PUBLIC_KEY=...                               │
│     └─> CORS_ORIGINS=https://your-frontend.vercel.app     │
│         (update after frontend deployment)                 │
│                                                             │
│  5. Deploy & Wait                                          │
│     └─> Get URL: https://clozone-api.onrender.com         │
│                                                             │
│  6. Test                                                   │
│     └─> curl [url]/api/health                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✅ Backend Live!
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: DEPLOY FRONTEND TO VERCEL (3-5 mins)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Create Vercel Account                                  │
│     └─> vercel.com                                         │
│                                                             │
│  2. New Project                                            │
│     ├─> Import from GitHub                                 │
│     ├─> Select: Sales-Trainer                             │
│     └─> Root Directory: frontend                          │
│                                                             │
│  3. Configure Build                                        │
│     ├─> Framework: Vite                                   │
│     ├─> Build: npm run build                              │
│     └─> Output: dist                                      │
│                                                             │
│  4. Set Environment Variables                              │
│     ├─> VITE_SUPABASE_URL=...                             │
│     ├─> VITE_SUPABASE_ANON_KEY=...                        │
│     └─> VITE_API_URL=https://[your-render-url]            │
│         (use URL from Step 1)                              │
│                                                             │
│  5. Deploy & Wait                                          │
│     └─> Get URL: https://your-app.vercel.app              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✅ Frontend Live!
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: UPDATE BACKEND CORS (2 mins) - CRITICAL!          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Go Back to Render Dashboard                            │
│     └─> Your backend web service                          │
│                                                             │
│  2. Environment Tab                                        │
│     └─> Edit CORS_ORIGINS                                 │
│                                                             │
│  3. Update Value                                           │
│     └─> CORS_ORIGINS=https://your-app.vercel.app          │
│         (use URL from Step 2)                              │
│                                                             │
│  4. Save Changes                                           │
│     └─> Auto-redeploys in ~2 mins                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✅ CORS Configured!
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: TEST EVERYTHING (5 mins)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ Backend health check                                   │
│  ✓ Frontend loads (no errors)                             │
│  ✓ Sign up / Login                                        │
│  ✓ Create organization                                    │
│  ✓ Invite team member                                     │
│  ✓ Start training session                                 │
│  ✓ View analytics                                         │
│  ✓ Export PDF                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
              🎉 DEPLOYMENT COMPLETE!
```

---

## Common Mistakes to Avoid

### ❌ Don't Do This:
1. **Deploy frontend first** - You need backend URL for frontend env vars
2. **Forget to update CORS** - Frontend won't be able to call backend
3. **Use placeholder values** - `your_key_here` won't work!
4. **Include trailing slashes** - URLs should NOT end with `/`
5. **Mix up HTTP/HTTPS** - Production must use `https://`
6. **Forget to commit/push** - Vercel/Render deploy from your Git repo

### ✅ Do This Instead:
1. **Deploy backend first** - Get the URL, then use it in frontend
2. **Update CORS immediately** - After frontend is deployed
3. **Use real credentials** - Copy from Supabase, OpenAI, VAPI dashboards
4. **No trailing slashes** - `https://api.clozone.ai` not `https://api.clozone.ai/`
5. **Always HTTPS in prod** - Both frontend and backend
6. **Push latest code** - `git add . && git commit && git push`

---

## Deployment Timeline

| Step | Time | What's Happening |
|------|------|------------------|
| **Backend Setup** | 3 min | Configure Render, add env vars |
| **Backend Deploy** | 2-5 min | Building, starting server |
| **Backend Test** | 1 min | Health check, verify it works |
| **Frontend Setup** | 2 min | Configure Vercel, add env vars |
| **Frontend Deploy** | 1-3 min | Building, deploying to CDN |
| **Update CORS** | 1 min | Add frontend URL to backend |
| **CORS Redeploy** | 2 min | Backend restarts with new CORS |
| **Testing** | 5 min | Full user flow verification |
| **Total** | **15-20 min** | From start to production! |

---

## Environment Variables Cheat Sheet

### Backend (Render)
```bash
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
VAPI_API_KEY=...
VAPI_PUBLIC_KEY=...
CORS_ORIGINS=https://your-app.vercel.app
LOG_LEVEL=warn
```

### Frontend (Vercel)
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://clozone-api.onrender.com
```

**Important:**
- All `https://` URLs
- No trailing slashes
- No quotes around values
- VITE prefix required for frontend

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **CORS error** | Update `CORS_ORIGINS` in Render to include Vercel URL |
| **API not found** | Check `VITE_API_URL` is correct (include https://) |
| **Build failed** | Check logs, verify all dependencies in package.json |
| **Backend slow** | Free tier sleeps - upgrade to Starter ($7/mo) |
| **Auth not working** | Verify Supabase keys are correct |
| **PDF not generating** | Check OpenAI API key is valid |

---

## Cost Summary

### Minimum (Free Tier):
- **Render Backend:** $0/month (sleeps after 15 min)
- **Vercel Frontend:** $0/month (always on)
- **Total:** **$0/month** ⚠️ Cold starts on backend

### Recommended (Production):
- **Render Backend:** $7/month (Starter - always on)
- **Vercel Frontend:** $0/month (Hobby tier)
- **Total:** **$7/month** ✅ No cold starts

### Pro Setup:
- **Render Backend:** $25/month (Standard)
- **Vercel Frontend:** $20/month (Pro tier)
- **Total:** **$45/month** 🚀 High performance

---

## Post-Deployment

### Immediate:
- [ ] Test all user flows
- [ ] Verify no console errors
- [ ] Check API calls succeed
- [ ] Test PDF generation

### Within 24 Hours:
- [ ] Set up custom domains
- [ ] Configure monitoring
- [ ] Test with real users
- [ ] Document your URLs

### Within 1 Week:
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Collect user feedback
- [ ] Plan first updates

---

**See `DEPLOY_VERCEL_RENDER.md` for complete step-by-step instructions!**

