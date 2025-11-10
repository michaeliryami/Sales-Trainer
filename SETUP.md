# 🚀 Quick Setup Guide

## First Time Setup (5 minutes)

### 1. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Use your favorite editor (nano, vim, code, etc.)
nano .env
```

**Required values in `.env`:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `OPENAI_API_KEY` - Your OpenAI API key
- `VAPI_API_KEY` - Your VAPI API key
- `VAPI_PUBLIC_KEY` - Your VAPI public key

### 2. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

**Required values in `.env.local`:**
- `VITE_SUPABASE_URL` - Same as backend
- `VITE_SUPABASE_ANON_KEY` - Same as backend

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Landing page (optional)
cd ../landing
npm install
```

---

## 🏃 Running in Development

### Terminal 1 - Backend API
```bash
cd backend
npm run dev
```
Expected output:
```
============================================================
🚀 Clozone API Server - DEVELOPMENT
============================================================
   Server: http://localhost:3002
   Health: http://localhost:3002/api/health
   Status: Ready to accept requests
============================================================
```

### Terminal 2 - Frontend App
```bash
cd frontend
npm run dev
```
Access at: **http://localhost:3000**

### Terminal 3 - Landing Page (optional)
```bash
cd landing
npm run dev
```
Access at: **http://localhost:3001**

---

## ✅ Verify Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3002/api/health
   ```
   Should return: `{"status":"ok","environment":"development"}`

2. **Frontend Access:**
   - Open http://localhost:3000
   - Should see Clozone login page

3. **Test Login:**
   - Create an account or sign in
   - Should redirect to `/create-session`

---

## 🔧 Environment Auto-Detection

The app automatically detects your environment:

| Environment | Detection | Features |
|-------------|-----------|----------|
| **Development** | Running on `localhost` | • Detailed logs<br>• Full error messages<br>• Request logging<br>• Permissive CORS |
| **Production** | Running on any other domain | • Minimal logs<br>• Generic errors<br>• Strict CORS<br>• Performance optimized |

---

## 🐛 Troubleshooting

### "Missing required environment variables"
- Check that `.env` exists in `backend/` folder
- Verify all required variables are set (no `your_*_here` placeholders)
- Restart the backend server

### "Port 3002 already in use"
```bash
# Kill existing process
lsof -ti:3002 | xargs kill -9

# Or change port in backend/.env
PORT=3003
```

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:3002/api/health`
- Clear browser cache and reload
- Check browser console for errors

### CORS errors
- In development, CORS should work automatically
- If issues persist, add your origin to `backend/.env`:
  ```
  CORS_ORIGINS=http://localhost:3000,http://localhost:3001
  ```

---

## 📚 Next Steps

Once development is working:

1. **Deploy to Production** - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Test with Real Data** - Create test organization in Supabase
3. **Customize Branding** - Update logos in `frontend/public/`

---

**Need help?** Check the console output - both servers log their configuration on startup! 🔍

