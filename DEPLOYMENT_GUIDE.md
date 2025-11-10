# 🚀 Clozone Deployment Guide

## Environment Setup

Clozone automatically detects whether you're running in **development** or **production** mode:

- **Development**: Detected when running on `localhost` or `127.0.0.1`
- **Production**: Detected when running on any other domain

---

## 🔧 Initial Setup

### 1. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` with your actual credentials:

```env
# Required for both dev and prod
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
VAPI_API_KEY=your_vapi_key
VAPI_PUBLIC_KEY=your_vapi_public_key

# Optional (defaults work for dev)
NODE_ENV=development
PORT=3002
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

### 2. Frontend Configuration

```bash
cd frontend
cp .env.example .env.local
```

Then edit `frontend/.env.local`:

```env
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Only needed for production
# VITE_API_URL=https://your-api-domain.com
```

---

## 💻 Development Mode

When running on **localhost**, the app automatically:
- ✅ Uses detailed logging
- ✅ Shows full error messages
- ✅ Frontend proxies API calls to `localhost:3002`
- ✅ CORS allows all localhost origins
- ✅ Request logging enabled

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Landing Page (optional):**
```bash
cd landing
npm run dev
```

---

## 🌐 Production Deployment

### Backend

1. **Set Production Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3002  # or your production port
   CORS_ORIGINS=https://app.clozone.ai,https://clozone.ai
   LOG_LEVEL=warn
   ```

2. **Build**
   ```bash
   cd backend
   npm run build
   ```

3. **Deploy**
   - Upload `backend/dist/` and `backend/package.json`
   - Install production dependencies: `npm install --production`
   - Start: `node dist/index.js`
   - Set environment variables on your hosting platform

### Frontend

1. **Set Production Environment Variables**
   ```env
   VITE_API_URL=https://api.clozone.ai  # Your backend URL
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Build**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   - Upload `frontend/dist/` to your static hosting
   - Configure as a Single Page Application (SPA)
   - All routes should serve `index.html`

### Landing Page

1. **Build**
   ```bash
   cd landing
   npm run build
   ```

2. **Deploy**
   - Upload `landing/dist/` to your static hosting
   - Can be served from root domain or subdomain

---

## 🔍 Environment Detection Features

### Auto-Detection Logic

**Backend:**
- Checks `NODE_ENV` environment variable
- Falls back to detecting port (3002 = development)
- Defaults to production for safety

**Frontend:**
- Checks `import.meta.env.MODE` (set by Vite)
- Checks `window.location.hostname` (localhost = development)
- Defaults to production for safety

### Configuration Differences

| Feature | Development | Production |
|---------|-------------|------------|
| **Logging** | Verbose, includes stack traces | Minimal, errors only |
| **CORS** | Permissive | Strict whitelist |
| **API Calls** | Vite proxy | Direct to API URL |
| **Error Messages** | Detailed | Generic |
| **Request Logging** | ✅ Enabled | ❌ Disabled |

---

## 🧪 Testing Production Build Locally

You can test the production build on your local machine:

### Backend
```bash
cd backend
NODE_ENV=production npm run build
NODE_ENV=production node dist/index.js
```

### Frontend
```bash
cd frontend
npm run build
npm run preview  # Serves production build locally
```

**Note:** When testing production frontend locally, you'll still need to set `VITE_API_URL` to point to your backend.

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] All `.env.example` files filled with actual values
- [ ] `CORS_ORIGINS` set to production domains
- [ ] `VITE_API_URL` set to production backend URL
- [ ] Database migrations applied
- [ ] OpenAI API key rotated (if previously exposed)
- [ ] VAPI keys configured
- [ ] SSL certificates configured
- [ ] Health check endpoint accessible: `https://api.yourdomain.com/api/health`
- [ ] Test user flows:
  - [ ] Admin login
  - [ ] Employee login
  - [ ] Create assignment
  - [ ] Start call
  - [ ] View analytics
  - [ ] Export PDF report

---

## 🆘 Troubleshooting

### Backend not starting
- Check `.env` file exists in `backend/` folder
- Verify all required environment variables are set
- Check port 3002 is not already in use

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:3002/api/health`
- Check Vite proxy configuration in `frontend/vite.config.ts`
- Clear browser cache and reload

### CORS errors in production
- Verify `CORS_ORIGINS` includes your frontend domain
- Must include protocol: `https://app.clozone.ai` not `app.clozone.ai`
- Multiple origins: `https://app.clozone.ai,https://clozone.ai`

### Environment not auto-detecting
- Backend: Set `NODE_ENV` explicitly
- Frontend: Set in build command: `VITE_NODE_ENV=production npm run build`

---

## 📚 Additional Resources

- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Express Production Best Practices: https://expressjs.com/en/advanced/best-practice-performance.html
- Supabase Production Checklist: https://supabase.com/docs/guides/platform/going-into-prod

---

**Questions?** Check the console logs on startup - both frontend and backend display their configuration.

