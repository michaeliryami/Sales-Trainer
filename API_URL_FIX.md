# API URL Fix - Production Deployment Issue

## Problem

After deploying to Render (backend) and Vercel (frontend), all API routes were returning HTML instead of JSON, causing the error:

```
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

## Root Cause

The frontend code was using plain `fetch('/api/...')` calls throughout the application. In production:

1. **Development**: Vite proxy handles relative URLs like `/api/analytics` and forwards them to the backend
2. **Production**: Without the Vite proxy, `/api/analytics` resolves to `https://your-vercel-domain.vercel.app/api/analytics`
3. Since Vercel doesn't have these API routes, it returns the HTML index page (for SPA routing)
4. The frontend tries to parse HTML as JSON → ERROR

## Solution

Created an `apiFetch` utility in `/frontend/src/utils/api.ts` that:

1. Checks if the app is in production mode
2. Prepends the configured `VITE_API_URL` environment variable to all `/api/` requests
3. Falls back to relative URLs in development (using Vite proxy)

## Files Updated

Replaced all `fetch('/api/...')` calls with `apiFetch('/api/...')` in:

1. **Analytics Pages**:
   - `/frontend/src/pages/Analytics.tsx` (8 calls)
   - `/frontend/src/pages/MyAnalytics.tsx` (6 calls)

2. **Training/Session Pages**:
   - `/frontend/src/pages/CreateSession.tsx` (10 calls)

3. **Admin/Organization Pages**:
   - `/frontend/src/pages/Admin.tsx` (4 calls)
   - `/frontend/src/pages/Organization.tsx` (5 calls)

4. **Context Providers**:
   - `/frontend/src/contexts/ProfileContext.tsx` (2 calls)
   - `/frontend/src/contexts/AuthContext.tsx` (1 call)

**Total**: 36 API calls updated across 7 files

## Required Environment Variable

Make sure `VITE_API_URL` is set in your Vercel environment variables to your Render backend URL:

```
VITE_API_URL=https://your-backend.onrender.com
```

## How It Works

### Before (Broken in Production):
```typescript
const response = await fetch('/api/analytics/admin/1')
// Production: https://your-vercel-app.vercel.app/api/analytics/admin/1 → HTML (404)
```

### After (Works in Production):
```typescript
const response = await apiFetch('/api/analytics/admin/1')
// Production: https://your-backend.onrender.com/api/analytics/admin/1 → JSON ✓
// Development: /api/analytics/admin/1 (Vite proxy) → JSON ✓
```

## Deployment Checklist

- [x] Replace all `fetch` calls with `apiFetch`
- [ ] Verify `VITE_API_URL` is set in Vercel environment variables
- [ ] Verify `CORS_ORIGINS` includes your Vercel frontend URL in Render backend
- [ ] Deploy to Vercel
- [ ] Test all routes in production

## Files Not Changed

Files that only use Supabase client (not backend API):
- Settings pages
- Auth callback pages
- Assignments page (uses Supabase directly)

