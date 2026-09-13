# 🚀 CineSense Deployment Guide (Vercel + Cloudflare)

This guide will help you link your repository to Vercel and point your Cloudflare domain to your API.

## 1. Vercel Project Setup

1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2.  **Import Repository**:
    *   Click **"Add New"** -> **"Project"**.
    *   Select your `CineSense` repository.
3.  **Configure Project Settings**:
    *   **Root Directory**: Set this to `backend`. (Very important since your `package.json` is inside that folder).
    *   **Framework Preset**: Select **"Other"** or it will automatically detect Express.
4.  **Environment Variables**:
    *   Add all the variables from your `.env` file to the Vercel dashboard:
        *   `MONGODB_URI`
        *   `TMDB_API_KEY`
        *   `GROQ_API_KEY`
    *   *Note: Do not add `PORT`, Vercel handles this.*
5.  **Deploy**: Click **"Deploy"**.

## 2. Connect Cloudflare Domain (`cinesense.stream`)

1.  In your Vercel project dashboard, go to **Settings > Domains**.
2.  Enter `cinesense.stream` and click **Add**.
3.  Vercel will give you two options. We recommend the **CNAME** approach for subdomains or **A Records** for apex domains:
    *   **Option A (Apex Domain - cinesense.stream)**:
        *   Point your `A` record to `76.76.21.21`.
    *   **Option B (Subdomain - api.cinesense.stream)**:
        *   Point a `CNAME` record to `cname.vercel-dns.com`.

### ⚠️ Cloudflare Settings (Crucial)
In your Cloudflare Dashboard:
*   **SSL/TLS**: Set to **"Full"** or **"Full (Strict)"**. Vercel provides its own SSL, but Cloudflare needs to communicate securely with it.
*   **Proxy Status**: You can keep the "Orange Cloud" (Proxied) turned **ON**, but if you face issues, try turning it to **"DNS Only"** first to verify the connection.

## 3. Flutter Production Toggle

I have added a configuration file to your Flutter app:
[**`lib/core/config/env_config.dart`**](file:///C:/Users/ravi/Desktop/CineSense/mobile/lib/core/config/env_config.dart)

When you are ready to test against the live domain:
```dart
static const bool isProduction = true; // Set this to true
```

## 4. GitHub Workflow

Since you have GitHub connected, every time you `git push` to your `main` branch, Vercel will automatically trigger a new deployment for your backend.
