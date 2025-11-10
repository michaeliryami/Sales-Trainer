# 🔧 Vercel 404 Fix for SPA Routing

## The Problem

When deploying a Single Page Application (SPA) like our React app to Vercel, you get 404 errors when:
- Directly accessing routes like `/assignments`, `/analytics`, etc.
- Refreshing the page on any route other than `/`
- Sharing deep links

**Error Example:**
```
GET https://your-app.vercel.app/assignments 404 (Not Found)
```

## Why This Happens

1. User visits `https://your-app.vercel.app/assignments`
2. Vercel looks for a file at `/assignments/index.html`
3. File doesn't exist → **404 Error**
4. React Router never loads, so it can't handle the routing

In a SPA, **all routes are handled by JavaScript** (React Router), not by the server. The server only needs to serve `index.html`, and React Router takes over from there.

## The Solution: `vercel.json`

Created: `frontend/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### What This Does:

1. **Rewrites:** Tells Vercel to serve `index.html` for ALL routes
   - User requests `/assignments` → Vercel serves `index.html`
   - React loads → React Router sees `/assignments` → Shows Assignments page ✅

2. **Headers:** Adds caching for static assets
   - Assets in `/assets/` folder are cached for 1 year
   - Improves performance and reduces bandwidth

## How to Apply

### Step 1: Commit and Push

```bash
git add frontend/vercel.json
git commit -m "fix: add vercel.json for SPA routing"
git push
```

### Step 2: Vercel Auto-Deploys

- Vercel detects the push
- Automatically triggers a new deployment
- Picks up the `vercel.json` configuration
- Deploys with the new routing rules

### Step 3: Verify It Works

After deployment completes, test these scenarios:

**Direct Navigation:**
```
https://your-app.vercel.app/assignments ✅
https://your-app.vercel.app/analytics ✅
https://your-app.vercel.app/organization ✅
```

**Refresh Test:**
1. Navigate to any route in the app
2. Press F5 or Cmd+R to refresh
3. Page should load correctly (not 404) ✅

**Deep Links:**
1. Copy URL from any page
2. Open in new tab/incognito
3. Should load correctly ✅

## Alternative: Vercel Dashboard Configuration

If you don't want to use `vercel.json`, you can configure this in the Vercel dashboard:

1. Go to your project settings
2. Navigate to **"Rewrites and Redirects"**
3. Add a rewrite:
   - **Source:** `/(.*)`
   - **Destination:** `/index.html`
   - Click **"Save"**

But using `vercel.json` is better because:
- Configuration is version-controlled
- Consistent across deployments
- No manual dashboard changes needed

## Common Mistakes

### ❌ Wrong: Redirects Instead of Rewrites

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This causes the URL to change to `/` in the browser, breaking deep links.

### ✅ Correct: Rewrites (URL stays the same)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This serves `index.html` but keeps the URL as `/assignments`, allowing React Router to work.

## Other Hosting Platforms

If you were using a different platform, here's how you'd fix it:

**Netlify:** Create `_redirects` file:
```
/*    /index.html   200
```

**Firebase Hosting:** In `firebase.json`:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache:** In `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Troubleshooting

### Still Getting 404s After Deploy?

1. **Check deployment completed:**
   - Go to Vercel dashboard → Deployments
   - Wait for "Ready" status
   - Click on the deployment to see logs

2. **Verify `vercel.json` is in the right place:**
   - Should be: `frontend/vercel.json`
   - NOT: `Sales-Trainer/vercel.json` (wrong)

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or use incognito/private mode

4. **Check Vercel detected the config:**
   - In deployment logs, look for "Detected vercel.json"
   - Should show your rewrite rules

### API Calls Returning 404?

That's a different issue. Check:
- `VITE_API_URL` environment variable is set correctly
- Backend `CORS_ORIGINS` includes your Vercel URL
- Backend is actually running (check Render status)

---

**This fix is essential for all SPAs on Vercel!** 🎉

