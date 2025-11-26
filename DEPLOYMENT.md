# Deployment Guide: Redis on Render

This guide explains how to set up Redis on Render and connect it to your backend service.

## 1. Create a Redis Instance on Render

1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Redis**.
3.  **Name**: Give it a name (e.g., `sales-trainer-redis`).
4.  **Region**: Choose the same region as your backend service (e.g., `Oregon (US West)`).
5.  **Max Memory Policy**: `noeviction` is fine for now.
6.  **Plan**: Select the **Free** plan (or a paid plan for production).
7.  Click **Create Redis**.

## 2. Get the Redis URL

Once the Redis instance is created:

1.  Wait for the status to turn **Available**.
2.  Look for the **Connections** section.
3.  Copy the **Internal Redis URL**. It will look something like:
    ```
    redis://red-cdef1234567890:6379
    ```
    *Note: Use the Internal URL if your backend is also on Render. Use the External URL only if connecting from outside Render.*

## 3. Configure Backend Environment Variables

1.  Go to your **Backend Web Service** on Render.
2.  Click on **Environment**.
3.  Add a new environment variable:
    - **Key**: `REDIS_URL`
    - **Value**: Paste the **Internal Redis URL** you copied.
4.  Click **Save Changes**.

## 4. Redeploy

Render usually triggers a redeploy automatically when environment variables change. If not, click **Manual Deploy** -> **Deploy latest commit**.

## Verification

Check your backend service logs on Render. You should see:
```
✅ Connected to Redis
👷 Session Worker ready to process jobs
```
If you see connection errors, ensure both services are in the same region.
